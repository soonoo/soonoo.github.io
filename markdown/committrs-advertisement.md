---
title: committrs 소개
description: 공개 SW 개발자대회 출품기
createdAt: 2019.11.24
---

# committrs 소개

### 공개 SW 개발자 대회
<div class='centered'><iframe src="//www.slideshare.net/slideshow/embed_code/key/stFcwpQ83tNQhn" width="514" height="422" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen></iframe></div>

우연한 기회에 [공개 SW 개발자대회](https://www.oss.kr/dev_competition)의 존재를 알게 되었고, 혼자 개발하고 있던 [committrs.io](https://committrs.io/soonoo)를 출품했다. 수상은 실패했지만 개인 프로젝트를 개발하고 출품하여 누군가에게 평가받는 과정 속에서 몇가지 느낀 점이 있었다.  
  
  
<br />
### commmittrs란?
개발 관련 주제를 검색하다 보면 종종 개인 블로그에 자신의 오픈 소스 프로젝트 기여 이력을 일일이 정리해 놓는 경우를 목격하곤 한다. 자신이 요청한 풀 리퀘스트나 이슈를 확인할 수 있는 하이퍼링크와 이에 대한 간단한 설명을 곁들여서 말이다. (GitHub 프로필에 자신이 기여한 유명 프로젝트를 pin 해놓는 경우도 이에 포함된다.)   
이러한 포스팅을 보면서 나를 포함한 많은 개발자들이 오픈 소스 프로젝트에 대한 기여 행위 그 자체보다도 잿밥에 더 관심이 많은게 아닐까 하는 생각을 하게 되었다.  
(ex. 링크드인 프로필 혹은 이력서에 본인을 `chromium 컨트리뷰터`라고 표시할수 있게됨!)
  
<br />
<br />
일단 나부터가 잿밥 쪽에 더 많은 관심을 갖고 있긴 하지만, 오픈 소스 프로젝트에 대한 관심을 어필하기 위한 목적으로만  개발에 참여하는 것은 몇가지 문제가 있다고 판단했다. 간단히 정리해보면 다음과 같다.
1. `react 컨트리뷰터`, `리눅스 커널 컨트리뷰터`와 같은 모호한 설명 문구로는 해당 개발자의 실질적인 기여 내용을 확인할 방법이 없다.
2. 1번 문제를 해결하기 위해 일일이 기여 행위를 정리하는 작업은 지루하다.

<br />
<br />
위의 두 가지 문제를 해결하기 위한 방법으로 다음과 같은 핵심 기능을 가진 committrs를 개발하였다.
1. GitHub 스타를 30개 받은 저장소에 대한 기여 이력을 수집하여 [프로필 페이지](https://committrs.io/soonoo)를 만들어 준다. 프로필 페이지를 통해 어떤 프로젝트에 어떤 코드를 기여했는지 확인할 수 있다.
2. [api](https://api.committrs.io/swagger)를 통해 기여 이력을 `json` 포맷으로도 제공한다. committrs가 제공하는 프로필 페이지가 마음에 들지 않으면 api 호출 결과를 개인 블로그나 링크드인 등의 서비스에 활용할 수 있다.


<br />
### 공개 SW 개발자 대회 피드백
![sw contest response](/docs/images/sw-contest-response.png)
<br />
앞서 언급한 것처럼 committrs를 공개 SW 개발자 대회에 출품하였고, 1차 온라인 심사를 거쳐 2차 오프라인 발표를 통해 평가받았다. 2차 심사 당시 심사 위원님들의 표정이 좋지 않았기 때문에 수상에 대한 기대는 일찌감치 접고 있었다.   
조금 놀라웠던 점은 대회가 마무리된 후 내가 했던 발표에 대한 피드백을 대회 주최 측에서 메일로 전달해 주었다는 점이다. 발표 전부터 내가 부족하다고 생각했던 것들에 대한 지적이 대부분이었지만 몇몇 긍정적인 내용의 의견도 있었다. 최근에 개발 의욕이 많이 떨어진 상태였는데 피드백을 바탕으로 조금씩이라도 committrs를 개선해 나가야겠다. 궁극적인 목표는 오픈 소스와 관련된 모든 기여 행위를 확인할 수 있는 프로필 페이지를 사용자에게 제공하는 것이다.(ex. GitLab에서 호스팅되는 프로젝트, 위키피디아 문서 작성, mdn 문서 작성 등)
