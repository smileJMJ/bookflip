// 플러그인

;(function($){
	$.fn.bookFlip = function(opts){		// 사용자가 입력한 옵션들
		// return : return 문을 사용하게 되면 이 플러그인을 다른 jQuery 메소드와 함께 자유롭게 체이닝을 사용할 수 있다.
		return this.each(function(){			 // this: jQuery 객체 자체를 나타낸다.
			
			var options = $.extend({}, $.fn.bookFlip.defaults, opts);			// 첫번째 인자값이 {} 빈 객체이므로 defaults 객체의 멤버와 opts(사용자정의 옵션값)이 merge되어 options에 담겨진다.
			
			var thisObj = $(this);				// each 내부에서 사용되는 this는 DOM요소를 차례로 가리킨다. each 내부의 this 키워드는 DOM 요소를 가리키기 때문에 
												//jQuery 래퍼객체($())로 감싸서 this를 참조해야 jQuery 메소드 사용이 가능해지며, 메소드 체인이 가능하다
			
			var directionNavDisplay = options.directionNavDisplay;
			var controlNavDisplay = options.controlNavDisplay;
			var playStopDisplay = options.playStopDisplay;
			var autoPlay = options.autoPlay;
			var duration = options.duration;
			var gapTime = options.gapTime;
			var bookWidth = options.bookWidth;
			var bookHeight = options.bookHeight;
			
			// selector
			var $container = thisObj;								// 이미지 슬라이드 구현될 영역
			var $bookflip = $container.children(".book_flip");		// 이미지들이 들어있으며, motionCon이 추가될 영역
			var imagesArr;											// 이미지 복사해서 넣을 배열
			var $motionCon;											// p_front, p_back, c_front, c_back 담기는 영역
			var $book_play;											// 재생버튼 
			var $controlNav; 										// 컨트롤 네비게이션
			var $directionNav;										// 다이렉션 네비게이션
			
			var tNum= 0;											// 페이지 인덱스 체크
			var conNum = 0;											// controlNav 클릭한 페이지 인덱스
			var allLength= 0;										// 이미지 개수
			var  zIndex1, zIndex2;									// p_front, c_back z-index 교환
			var timer;												// 자동 재생 타이머
			
			var ready = true;										// 모션 동작 여부를 나타냄. true: 책넘기는 모션 중, false: 모션 종료됨
			var IEversion;											// ie 버전 체크
			
			var flipMethods = {}; 
			
			function getIEversion(){
				var ua = navigator.userAgent;
				var version;
				
				if(navigator.appName === "Microsoft Internet Explorer"){
						version = ua.split("MSIE ")[1].split(";")[0];			// IE 10이하 버전에선 MSIE 10.0 형태로 표시되어 이를 잘라냄
						if(Number(version) < 10){		// IE 10 미만일 때
							return IEversion = "low";
						}else{		// IE 10일 때
							return IEversion = "high";	
						}
					}else{		// chrome, IE 11, edge 일 때
						return IEversion = "high";
					}
			}
			
			// flip animation
			flipMethods = {
				init:function(){
					imagesArr = $container.find(".book_item");
					$bookflip.children().remove();
					$bookflip.append(imagesArr[0]);
					allLength = imagesArr.length;

					$container.css({"width":bookWidth, "height":bookHeight});
					$bookflip.css({"width":bookWidth, "height":bookHeight});
					
					flipMethods.motionCon();
					if(imagesArr.length==1){	// 이미지 한개일때
						autoPlay = false;
						controlNavDisplay = false;
						directionNavDisplay = false;
						playStopDisplay = false;
						$motionCon.remove();		// motionCon있으면 링크가 가려짐
					}	
					
					if(autoPlay){flipMethods.autoPlay();}
					if(controlNavDisplay){flipMethods.controlNav.setup();}
					if(directionNavDisplay){flipMethods.directionNav.setup();}
					if(playStopDisplay){flipMethods.playStop.setup();}
					
					getIEversion();		// IE 버전 체크
				},
				motionCon:function(){
				
					var motionConStr = "<div class='motionCon'><div class='p_back'></div><div class='p_front'></div><div class='c_back'></div><div class='c_front'></div></div>";
					
					$bookflip.append(motionConStr);
					$motionCon = $bookflip.find(".motionCon");
					
				},
				
				controlNav:{
					setup:function(){
						var controlNavStr = "<nav class='controlNav'></nav>";
						$container.append(controlNavStr);
						$controlNav = $container.find(".controlNav");	
						
						if(allLength!=0){
							for(var i=0;i<allLength;i++){
								$controlNav.append("<span>"+i+"</span>");
							}
						}
						
						conNum = 0;
						
						flipMethods.controlNav.active(tNum);		// 현재 페이지의 controlNav에 active 클래스 줌
						
						$controlNav.children().on("click", function(e){
							if(!ready) return;		// transform 실행 중이면 클릭이벤트 실행하지 않도록 함
							ready = false;		
							flipMethods.motionCon();
							
							conNum = Number(e.target.innerText);		// 클릭한 controlNav 인덱스
							if(tNum < conNum){						// 현재 페이지보다 뒤의 페이지 클릭 시
								flipMethods.nextPageMove("controlNav");
							}else if(tNum == conNum){				// 현재 페이지랑 같은 페이지 클릭 시
								ready = true;	
							}else{									// 현재 페이지보다 전의 페이지 클릭 시
								flipMethods.prevPageMove("controlNav");
							}	
							flipMethods.controlNav.active(conNum);
						});
					},
					active:function(num){
						$controlNav.children().eq(num).addClass("active").siblings().removeClass("active");
					}
				},			// E: controlNav
				directionNav:{
					setup:function(){
						var directionNavStr = "<nav class='directionNav'><a id='book_prev' href='#'>Previous</a> <a id='book_next' href='#'>Next</a></nav>";
						$container.append(directionNavStr);
						$directionNav = $container.find(".directionNav");
						$directionNav.children().on("click", function(e){
							e.preventDefault();
							if(!ready) return;		// transform 실행 중이면 클릭이벤트 실행하지 않도록 함
							ready = false;		
							flipMethods.motionCon();
							
							if(this.id==="book_prev") flipMethods.prevPageMove("directionNav");
							else flipMethods.nextPageMove("directionNav");
						});
					}
				},
				autoPlay:function(){
					timer = setTimeout(function(){
						clearTimeout(timer);
						if(!ready) return;		// transform 실행 중이면 클릭이벤트 실행하지 않도록 함
						ready = false;		
						flipMethods.motionCon();
						flipMethods.nextPageMove("directionNav");
					}, gapTime);
				},
				playStop:{
					setup:function(){
						var autoPlayStr = "<nav class='playstop'><a id='book_play' href='#'>Pause</a></nav>"
						$container.append(autoPlayStr);
						$book_play = $container.find("#book_play");
						if(autoPlay) $book_play.addClass("play");
						
						$book_play.on("click", function(e){
							e.preventDefault();
							if(!autoPlay){		// 일시정지일 때
								$book_play.removeClass("play").text("Play");
								flipMethods.playStop.onPlay();
								autoPlay = true;
							}else{				// 자동재생 중일때
								$book_play.addClass("play").text("Pause");
								flipMethods.playStop.onStop();
								autoPlay = false;
							}
						});
					},
					onPlay:function(){
						$book_play.addClass("play").text("Pause");
						flipMethods.autoPlay();
					},
					onStop:function(){
						$book_play.removeClass("play").text("Play");
						clearInterval(timer);
					}
				
				},
				
				// 다음 페이지 이동 함수
				nextPageMove:function(kind){
						$motionCon.removeClass("prev");
						// motionCon의 .p_back, p_front, c_back, c_front에 이미지 추가하기
						$motionCon.find('.p_front').append($(imagesArr[tNum]).clone());
						
						flipMethods.findTarget(kind, "next");
						
						if(controlNavDisplay){flipMethods.controlNav.active(tNum);}	// 컨트롤 네비게이션 active 나타냄
						
						$motionCon.find('.c_back').append($(imagesArr[tNum]).clone());
						$motionCon.find('.c_front').append($(imagesArr[tNum]).clone());
					
					if(IEversion === "high"){
						if(bookWidth%2 != 0){
							$motionCon.children(".p_front").css("left", "-0.5px");		// chorme에선 p_front, p_back 사이에 0.5px만큼 공간이 있었고, 익스에서도 0.5px만큼 밀려서 이를 해결하기 위해 p_front의 left를 -0.5px로 조절함
						}
						$motionCon.children(".p_front").find("img").css("margin-left", -(bookWidth*0.5));
						$motionCon.children(".c_front").find("img").css("margin-left", -(bookWidth*0.5));
						//$motionCon.children(".p_front").css("left", "-0.5px");		// chorme에선 p_front, p_back 사이에 0.5px만큼 공간이 있었고, 익스에서도 0.5px만큼 밀려서 이를 해결하기 위해 p_front의 left를 -0.5px로 조절함
					
						TweenMax.to($motionCon.find('.p_front'), duration, {transform:'rotateY(-180deg)', ease:Cubic.easeInOut, onUpdate:flipMethods.update, onComplete:flipMethods.tweenComplete});
						TweenMax.to($motionCon.find('.c_back'), duration, {transform:'rotateY(0deg)', ease:Cubic.easeInOut});
						TweenMax.delayedCall((duration/2), flipMethods.changeDepth, ["next"]);	
					}else{
						$motionCon.find(".c_back").css("display", "none");
						$motionCon.find(".p_front").children("div").css({"width":bookWidth, "left":0});
						$motionCon.find(".c_front").css({"width":bookWidth, "left":bookWidth});
						
						TweenMax.to($motionCon.find('.p_front'), duration*0.7, {left:-bookWidth, ease:Cubic.easeInOut,onComplete:flipMethods.tweenComplete});
						TweenMax.to($motionCon.find('.c_front'), duration*0.7, {left:0, ease:Cubic.easeInOut});
					}
						
				},
				// 이전 페이지 이동 함수
				prevPageMove:function(kind){
					$motionCon.addClass("prev");
					
					// motionCon의 .p_back, p_front, c_back, c_front에 이미지 추가하기
					$motionCon.find('.c_back').append($(imagesArr[tNum]).clone());
					$motionCon.find('.c_front').append($(imagesArr[tNum]).clone());
					
					flipMethods.findTarget(kind, "prev");
					
					if(controlNavDisplay){flipMethods.controlNav.active(tNum);}	// 컨트롤 네비게이션 active 나타냄
					
					$motionCon.find('.p_back').append($(imagesArr[tNum]).clone());
					$motionCon.find('.p_front').append($(imagesArr[tNum]).clone());
					
					if(IEversion === "high"){
						if(bookWidth%2 != 0){
							$motionCon.children(".p_front").css("left", "-0.5px");		// chorme에선 p_front, p_back 사이에 0.5px만큼 공간이 있었고, 익스에서도 0.5px만큼 밀려서 이를 해결하기 위해 p_front의 left를 -0.5px로 조절함
						}
						$motionCon.children(".p_front").find("img").css("margin-left", -(bookWidth/2));
						$motionCon.children(".c_front").find("img").css("margin-left", -(bookWidth/2));
						//$motionCon.children(".p_front").css("left", "-0.5px");		// chorme에선 p_front, p_back 사이에 0.5px만큼 공간이 있었고, 익스에서도 0.5px만큼 밀려서 이를 해결하기 위해 p_front의 left를 -0.5px로 조절함
						
						TweenMax.to($motionCon.find('.c_back'), duration, {transform:'rotateY(180deg)', ease:Cubic.easeInOut, onComplete:flipMethods.tweenComplete});
						TweenMax.to($motionCon.find('.p_front'), duration, {transform:'rotateY(0deg)', ease:Cubic.easeInOut});
						TweenMax.delayedCall((duration/2), flipMethods.changeDepth, ["prev"]);	
					}else{
						$motionCon.find(".c_back").css("display", "none");
						$motionCon.find(".p_front").css({"left":-bookWidth, "transform":"none"}).children("div").css({"width":bookWidth, "left":0});
						$motionCon.find(".c_front").css({"width":bookWidth, "left":0});
						
						TweenMax.to($motionCon.find('.p_front'), duration*0.7, {left:0, ease:Sine.easeInOut});
						TweenMax.to($motionCon.find('.c_front'), duration*0.7, {left:bookWidth, ease:Sine.easeInOut, onComplete:flipMethods.tweenComplete});
					}
				},
				tweenComplete:function(){
					$bookflip.children(".book_item").remove();
					$bookflip.append($(imagesArr[tNum]).clone());
					$motionCon.remove();
					
					ready = true;		// ready를 true로 변경하여 transform 종료됨을 알림
					if(autoPlay) flipMethods.autoPlay();
				},
				// p_front, c_back z-index 교환 함수
				changeDepth:function(direction){
					if(direction==="next"){
						$motionCon.find('.p_front').css("z-index", 2);
						$motionCon.find('.c_back').css("z-index", 3);
					}else{
						$motionCon.find('.p_front').css("z-index", 3);
						$motionCon.find('.c_back').css("z-index", 2);
					}
				},
				update:function(){
					$motionCon.children(".p_front").css("left", "-0.5px");
				},
				findTarget:function(kind, dir){
					if(kind==="directionNav"){
						if(dir==="next"){tNum++;}
						else{tNum--;}
						if(tNum > (allLength-1)){		// 이미지 수보다 tNum이 커지면 처음으로 돌아가도록
							tNum = 0;
						}else if(tNum < 0){		// 이미지 수보다 tNum이 작아지면 맨끝으로 돌아가도록
							tNum = allLength-1;
						}
					}else{
						tNum=conNum;
					}
				}
			};
			
			flipMethods.init();
			 
		});		// return this.each()
	};		// $.fn.bookFilp
	
	// 기본값을 변경할 수 있게 하려면 다음과 같이 기본값에 대한 정의를 플러그인 메소드 밖에서 작성하여
    // 플러그인 밖에서도 접근할 수 있는 곳에 위치시켜야 한다.
	
	$.fn.bookFlip.defaults = {
		directionNavDisplay: true,		// 이전, 다음 버튼 유무
		controlNavDisplay: true,		// 컨트롤 버튼 유무
		playStopDisplay: true,			// 재생, 일시정지 버튼 유무
		autoPlay: true,					// 자동 재생 여부
		duration: 0.8,					// Flip 애니메이션 실행 시간. 1 -> 1s임
		gapTime: 3000,					// timer 지연시간
		bookWidth: 250,					// 이미지 너비
		bookHeight: 173					// 이미지 높이
	}
	
})(jQuery);