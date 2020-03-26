---
title: Nginx reload와 HTTP/1.1의 Connection 헤더
description: Nginx reload와 HTTP/1.1의 Connection 헤더
createdAt: 2020.03.26
tags: nginx, http, Keep-Alive
---


# Nginx reload와 HTTP/1.1의 Connection 헤더
[Blue-Green 배포 방법](https://martinfowler.com/bliki/BlueGreenDeployment.html)을 이용하면 서비스 중단 시간을 최소화하면서 배포를 진행할 수 있다. blue-green 배포에 관한 설명은 웹에서 쉽게 찾아 볼 수 있으므로 배포 과정 중에 겪은 이슈만 간단하게 정리해본다.  

## nginx -s reload
`nginx -s reload` 명령어는 현재 실행 중인 Nginx 프로세스에 realod 시그널을 보낸다. reload 시그널을 받은 Nginx는 프로세스를 재시작하지 않고 `nginx.conf` 파일만 다시 로드한다. 이 기능을 이용하면 `nginx.conf` 내의 리버스 프록시 포트만 바꾸고 reload 시그널을 보내는 방식으로 blue-green 배포가 가능해진다. Nginx 공식 문서에서는 이를 [zero-downtime reload](https://www.nginx.com/faq/how-does-zero-downtime-configuration-testingreload-in-nginx-plus-work/)라고 홍보하고 있으며, 현재 연결 중인 커넥션에 영향을 주지 않고 설정 파일만을 리로드할 수 있다고 한다.  

## 진짜 zero-downtime일까?
Nginx가 실제로 다운타임 없이 설정 파일만을 리로드하는지 궁금해졌고, [wrk](https://github.com/wg/wrk)를 이용하여 간단하게 테스트 해보았다. 테스트 시나리오는 다음과 같다.
1. 8001번 포트에 API 서버를 띄운다.
2. Nginx는 80번 포트를 통해 실행 중이며 리버스 프록시 기능을 이용하여 클라이언트의 요청을 8001번 포트로 포워딩한다.
3. `wrk -t7 -c20 -d60s http://127.0.0.1:80/users` 명령어로 벤치마크를 실행한다.
4. 8002번 포트에서 새로운 API 서버를 띄운다.
5. Nginx가 8002번 포트로 클라이언트의 요청을 포워딩하도록 `nginx.conf` 파일을 수정한다.
6. Nginx에 리로드 시그널을 보낸다.
7. 벤치마크가 성공적으로 완료되었는지 확인한다.

예상대로라면 `wrk`가 80번 포트로 보낸 모든 요청이 성공해야 한다. 하지만 결과는 그렇지 않았다. 벤치마크 결과의 `Socket errors` 항목을 보면 일부 요청에서 socket read 에러가 발생한다.
```
$ wrk -t7 -c20 -d10s http://127.0.0.1:80/users
Running 10s test @ http://127.0.0.1:80/users
  7 threads and 20 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    23.70ms   36.38ms 331.63ms   92.70%
    Req/Sec   122.27     76.01   464.00     73.78%
  8304 requests in 10.07s, 5.54MB read
  Socket errors: connect 0, read 14, write 0, timeout 0
Requests/sec:    824.40
Transfer/sec:    563.52KB
```

## Nginx의 reload 방식
Nginx가 리로드 시그널을 받으면 워커 프로세스들은 현재 처리 중인 http 요청까지만 응답하고 tcp 커넥션을 끊어버린다. 설정 파일이 리로드 된 후에 들어오는 http 요청은 새로운 워커 프로세스가 처리한다. `wrk`는 tcp 커넥션을 재사용하려고 시도하므로 Nginx에 의해 끊긴 tcp 커넥션을 통해 http 요청을 생성하려 할 때 에러가 발생하게 된다. 아무리 관련 문서를 찾아 보아도 이런 상황에 대한 언급은 찾을 수 없었다. 죄다 Nginx가 zero-downtime, graceful reload를 지원한다는 블로그 포스팅뿐이었다. 내가 보기엔 전혀 graceful하지 않은 상황인데 말이다. 그리고 `Connection: Keep-Alive` 헤더를 통해 tcp 커넥션을 재사용 중인 웹 브라우저가 있는 상태에서 Nginx를 리로드하면 다운타임이 발생하지 않을까 하는 의문이 들었다.

## HTTP/1.1 Connection 헤더
> When a client or server wishes to time-out it SHOULD issue a graceful
close on the transport connection. Clients and servers SHOULD both
constantly watch for the other side of the transport close, and
respond to it as appropriate. If a client or server does not detect
the other side's close promptly it could cause unnecessary resource
drain on the network.
...
...
This means that clients, servers, and proxies MUST be able to recover
rom asynchronous close events. Client software SHOULD reopen the
transport connection and retransmit the aborted sequence of requests
without user interaction so long as the request sequence is
idempotent (see section 9.1.2). Non-idempotent methods or sequences
MUST NOT be automatically retried, although user agents MAY offer a
human operator the choice of retrying the request(s). Confirmation by
user-agent software with semantic understanding of the application
AY substitute for user confirmation. The automatic retry SHOULD NOT
be repeated if the second sequence of requests fails.  

[HTTP/1.1 스펙](https://tools.ietf.org/html/rfc2616#section-8.1)에 의하면 클라이언트와 서버는 응답에 `Connection: Keep-Alive` 헤더가 존재할 경우 tcp 커넥션을 재사용해야 한다. HTTP/1.1은 `Connection` 헤더의 디폴트 값이 `Keep-Alive`이고 이는 `Connection` 헤더를 따로 설정하지 않는 한 항상 tcp 커넥션을 재사용해야 한다는 말이 된다.  
또한 클라이언트와 서버는 언제든지 tcp 커넥션을 끊을 수 있다. 단 커넥션을 끊을 때에는 graceful한 방법을 이용해야 하며 이는 `Connection: close` 헤더를 통해 tcp 커넥션을 끊겠다는 사실을 명시적으로 전달해야 함을 의미한다. 하지만 스펙에서 `Connection: close` 헤더의 이용을 강제하고 있지는 않다. 그렇다면 `Connection: close` 헤더 없이 tcp 커넥션을 끊어버리면 어떻게 될까?  
마찬가지로 스펙에 따르면 클라이언트와 서버는 예기치 못한 tcp 커넥션 close로부터 적절한 복구 작업을 실행해야한다. 즉 서버가 `Connection: close` 헤더 없이 일방적으로 커넥션을 끊을 경우 클라이언트(ex. 웹 브라우저)는 요청을 재시도하는 등의 액션을 취해야 한다. 복구 방법에 대한 방법이나 구현 세부 사항에 대한 부분은 스펙에서 따로 언급되지 않는다.  

Nginx가 리로드 시그널을 받았을 때에 각 워커 프로세스가 요청을 추가적으로 기다렸다가 `Connection: close` 헤더를 클라이언트에 전달할 수 있긴 하지만, 이 방법은 구현이 복잡하고 리로드 시에 지연이 발생할 수 있어서 사용하지 않는다고 한다.  
출처: [https://trac.nginx.org/nginx/ticket/1022#comment:1](https://trac.nginx.org/nginx/ticket/1022#comment:1)
