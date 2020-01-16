---
title: 동시성, 병렬성 그리고 Go에 대해 알게된 내용들
description: 동시성, 병렬성 그리고 Go에 대해 알게된 내용들
createdAt: 2020.01.16
---

# 동시성, 병렬성 그리고 Go에 대해 알게된 내용들

## 동시성, 병렬성
Rob Pike가 설명하는 concurrency와 parallelism  
[출처] [https://blog.golang.org/concurrency-is-not-parallelism](https://blog.golang.org/concurrency-is-not-parallelism)  
#### 동시성(Concurrency)
- 독립적으로 실행 중인 프로세스(작업) 들을 결합(composition)하는 행위.
- 여러 개의 작업을 '다루는' 것에 관한 개념.
동시성을 통해 병렬성을 달성할 수 있긴 하지만 동시성의 목적이 병렬성은 아님. 동시성의 목적은 '구조화'에 있음. 동시성은 프로그램을 여러 개의 작은 부분으로 나누어 각각의 부분이 서로 정보를 주고 받으며 독립적으로 실행될 수 있도록 하는 구조화 작업.

ex) OS는 마우스, 키보드, 스크린 등 다양한 주변 장치를 제어하지만 이러한 여러 개의 장치를 관리하기 위해서 병렬 작업이 필요한 건 아님. 하나의 CPU 코어로도 처리가 가능함. 

#### 병렬성(Parallelism)
- 여러 개의 작업을 '동시에 실행'하는 것.  

ex) 두 개의 코어가 각기 다른 스레드/프로세스를 실행.
<br />
<br />
## Goroutine
- Go 프로그램 내에서 독립적으로 실행되는 함수/메서드. Go는 Goroutine을 통해 동시성을 지원함.
- Goroutine은 [Go runtime](https://golang.org/pkg/runtime/)에 의해 스케줄링됨. Go runtime은 Go 프로그램을 실행할 때 사용되는 라이브러리로 메모리 관리, GC 등도 처리함.
- Goroutine은 스레드와 유사함. 하지만 운영체제 스레드와 1:1로 맵핑되는 자바 스레드와는 다름.
- Goroutine 간의 통신은 Channel을 통해 이루어짐. 자원에 대한 접근 제한을 위한 [뮤텍스](https://golang.org/pkg/sync/#Mutex)도 패키지로 제공됨.

이벤트 드리븐 방식의 프로그램 혹은 동시에 여러 외부 자원을 요청하고(e.g. 외부 api 호출, DB 접근 등 I/O intensive한 작업) 응답을 기다리는 프로그램은 동시성을 고려하여 작성할 경우 성능 향상을 얻을 수 있음.
<br />
<br />
## 초간단 Go 스케줄러 알아보기
Go 스케줄러는 매 라운드마다 실행 가능한 Goroutine을 찾아 스레드에 할당한다. Go runtime이 생성하는 스레드의 수는 `GOMAXPROCS` 환경 변수에 의해 결정됨. 하지만 실제로 생성되는 스레드는 `GOMAXPROCS`보다 많을 수 있음. `GOMAXPROCS`는 CPU 코어의 수로 초기화되지만 런타임에 변경할 수 있음. (`GOMAXPROCS`가 정확히 어떻게 사용되는지 잘 모르겠다. 소스 코드에 답이 있을테지만 볼 용기가 안난다.)  
Goroutine이 새로 생성되거나 실행 가능한 상태가 되면 각 코어의 local queue에 추가됨. 각 코어는 큐에서 실행 가능한 Goroutine을 찾아서 실행하고 실행이 끝난 Goroutine은 큐에서 제거함. 큐에서 실행 가능한 Goroutine을 찾지 못할 경우 다른 코어의 큐에서 Goroutine을 훔쳐옴(?!) 이를 [work-stealing](https://en.wikipedia.org/wiki/Work_stealing) 스케줄링 방식이라고 함.  
[출처]  
[https://rakyll.org/scheduler/](https://rakyll.org/scheduler/)  
[https://github.com/golang/go/blob/master/src/runtime/proc.go](https://github.com/golang/go/blob/master/src/runtime/proc.go)
