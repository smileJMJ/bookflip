# bookflip
이미지 슬라이드 (bookflip 효과) [2015~2016]

책을 넘기는 듯한 전환 효과 및 IE 9 이하에서도 동작하는 슬라이드가 필요하여 직접 개발하게 되었습니다.  
IE 9 이하에서는 좌우로 슬라이드 되도록 구현하였습니다.

# 사용 방법
jquery, TweenMax, bookflip.js  
bookflip.css 를 import 합니다.

# 호출 코드
```
$("#main_visual").bookFlip({
  bookWidth:251,
  bookHeight:173,
  autoPlay: true,					
  duration: 0.5,					
  gapTime: 2000		
});
```
- bookWidth: 슬라이드 너비
- bookHeight: 슬라이드 높이
- autoPlay: 자동 재생 여부
- duration: 슬라이드 전환 모션 실행 시간
- gapTime: 다음 슬라이드로 전환되는 딜레이 시간
- directionNavDisplay: 좌우 방향 버튼 사용 여부
- controlNavDisplay: 인디케이터 버튼 사용 어부
- playStopDisplay: 재생/정지 버튼 사용 여부

# 데모
https://smilejmj.github.io/bookflip/index4_plugin.html
