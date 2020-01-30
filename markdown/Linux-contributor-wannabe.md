---
title: 리눅스 커널에 내 이름 석자 올리기(실패의 경험)
description: 하지만 실패
createdAt: 2019.10.27
tags: 리눅스
---

# 리눅스 커널에 이름 석자 올리기

몇 달 전 리눅스 커널에 패치를 보냈던 일이 갑자기 생각나 기록을 남긴다. 패치를 보낸 이유를 간단히 추려보면 다음과 같다.
- 커널 개발자들이 (왠지) 멋있어 보여서
- 전 세계 수 천, 수 억 대의 리눅스 머신이 내 코드를 구동하는 짜릿한 경험을 해보고 싶어서

커널 패치 제출은 아래의 과정을 통해 이루어진다.

1. 수정한 코드의 diff 패치를 만든다.
```c
Singed-off-by: Soonwoo Hong <qpseh2m7@gmail.com>
---
 block/blk-mq.c | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

diff --git a/block/blk-mq.c b/block/blk-mq.c
index ce0f5f4ede70..374b13e89bb1 100644
--- a/block/blk-mq.c
+++ b/block/blk-mq.c
@@ -1377,7 +1377,7 @@ static void __blk_mq_run_hw_queue(struct blk_mq_hw_ctx *hctx)
                cpu_online(hctx->next_cpu)) {
                printk(KERN_WARNING "run queue from wrong CPU %d, hctx %s\n",
                        raw_smp_processor_id(),
-                       cpumask_empty(hctx->cpumask) ? "inactive": "active");
+                       cpumask_empty(hctx->cpumask) ? "inactive" : "active");
                dump_stack();
        }
```
나는 NVMe SSD의 드라이버에서 쓰이는 [블록 멀티큐](http://kernel.dk/blk-mq.pdf) 코드를 수정했다. 공백 한 칸을 추가했다. 살짝 창피하지만 이게 전부다.


2. 적절한 메인테이너를 찾아 메일로 패치를 보낸다.
리눅스는 드라이버, 서브시스템 별로 메인테이너가 존재하고 토발즈가 릴리즈를 관리한다. 패치 만드는 법, 메인테이너 찾는 법은 [관련 자료](https://dry-kiss.blogspot.com/2012/10/blog-post.html)를 참조했다.
블록 디바이스 관련 코드는 [Jens Axobe](https://www.linkedin.com/in/jens-axboe-60a11b1/)라는 아저씨가 관리하지만 나는 조금이라도 패치를 잘 받아줄것 같은 [Greg](https://www.linkedin.com/in/greg-kroah-hartman/?originalSubdomain=nl)이라는 아저씨에게 메일을 보냈다. 로직과 관련 없는 코드 수정이니 누구한테 보내든 상관 없을것 같았다. 

![greg's response](/docs/images/greg-response.png)
답변 내용을 요약해보면 'drivers/staging 디렉토리 외의 코드는 코딩 스타일 수정하는게 쉽지 않아. 괜히 힘빼지마' 정도 되겠다. 
위의 메일 내용을 바탕으로 페이스북 그룹에 질문을 올렸고, 로직과 상관 없는 코드도 철저히 메인테이너 관리 하에 변경이 이루어지며 메인테이너 성향에 따라 사소한 코딩 스타일 수정같이 별 영양가 없는 패치를 반기지 않을 수 도 있다는 피드백을 받았다. (패치를 받아줄지는 철저히 메인테이너의 권한)

허접한 술수로 리눅스 커널에 이름 석자 올리기는 실패했으니 시간 많을 때 다른 방법을 고민해 봐야겠다.

