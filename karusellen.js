/*! KarusellenJS: an easy to use vanillaJS carousel. Copyright 2015 @utegard. Licensed MIT */

;(function(window, undefined){
	'use strict';

	var Karusellen = window.Karusellen || {};

	Karusellen = function(options){

		var _settings = {
			karusellenClass: 'karusellen',
			karusellenContentClass: 'karusellen-content',
			karusellenItemClass: 'karusellen-content__item',
			itemsToShow: 2,
			itemFloatDirection: 'left',
			buttonsWrapperClass: 'karusellen-controls',
			buttonClass: 'karusellen-controls__button',
			prevButtonClass: 'karusellen-controls__button--prev',
			prevButtonInnerHTML: '<span class=\"visually-hidden\">Previous Slide</span>',
			nextButtonClass: 'karusellen-controls__button--next',
			nextButtonInnerHTML: '<span class=\"visually-hidden\">Next Slide</span>'
		};

		Object.defineProperty(this, 'settings', {
			
			get: function(){
				return _settings;
			},
			set: function(settingsObject){
				
				if(typeof settingsObject !== 'object'){
					throw new Error('settings is not an object');	
				}
				_settings = settingsObject;
			}

		});

		if(options && typeof options === 'object'){
			this.settings = squash(this.settings, options);
		}
		
		this.init();
	};

	Karusellen.prototype = {

		init: function(){
			this.loadCarousel();
		},

		loadCarousel: function(){

			var self = this;
			var carouselItems = document.getElementsByClassName(this.settings.karusellenClass);
			
			[].forEach.call(carouselItems, function(carousel){
			
				var referenceObj = {
					original: carousel,
					clone: carousel.cloneNode(true)
				};

				new MerryGoRound(referenceObj, self.settings);

			});
		}
	};

	var MerryGoRound = function(_referenceObj, _settings){

		Object.defineProperty(this, 'settings', {
			
			get: function(){
				return _settings;
			},
			set: function(settingsObject){
				
				if(typeof settingsObject !== 'object'){
					throw new Error('settings is not an object');	
				}
				_settings = settingsObject;
			}

		});

		Object.defineProperty(this, 'referenceObj', {
			
			get: function(){
				return _referenceObj;
			},
			set: function(referenceObj){
				
				if(typeof referenceObj !== 'object'){
					throw new Error('settings is not an object');	
				}
				_referenceObj = referenceObj;
			}

		});

		this.init();
	};

	MerryGoRound.prototype = {
		
		init: function(){
			this.defineProps();
			this.scaffold();
		},

		defineProps: function(){

			var _currentSlide = 0,
				_amountOfItems = this.referenceObj.clone.children.length,
				_hasTouchSupport = (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);

			Object.defineProperty(this, 'hasTouchSupport', {
				
				get: function(){
					return _hasTouchSupport;
				},
				set: function(value){
					_hasTouchSupport = value;
				}

			});

			Object.defineProperty(this, 'currentSlide', {
				
				get: function(){
					return _currentSlide;
				},
				set: function(value){
					var intVal = parseInt(value, 10);
					if(isNaN(intVal)){
						throw new Error('currentSlide must be an integer');
					}
					_currentSlide = value;
				}

			});

			Object.defineProperty(this, 'amountOfItems', {
				
				get: function(){
					return _amountOfItems;
				},
				set: function(value){
					var intVal = parseInt(value, 10);
					if(isNaN(intVal) || intVal < 1){
						throw new Error('amountOfItems must be an integer');
					}
					_amountOfItems = value;
				}

			});
		},

		scaffold: function(){
			var self = this,
				fragment = document.createDocumentFragment(),
				nodeType = this.referenceObj.clone.nodeName.toLowerCase(),
				karusellenList = null;

			if(nodeType === 'ul' || nodeType === 'ol'){
				karusellenList = document.createElement('li');
				karusellenList.style.width = 100 + '%';
				this.karusellenContent = document.createElement(nodeType);
			}else{
				this.karusellenContent = document.createElement('div');
			}
			
			var size = this.getCarouselSize();
			this.karusellenContent.className = this.settings.karusellenContentClass;
			this.karusellenContent.style.width = size.carouselWidth + '%';

			[].slice.call(this.referenceObj.clone.children).map(function(item, index){

				if(item.hasAttribute('class')){
					item.className += ' ' + self.settings.karusellenItemClass;	
				}else{
					item.className = self.settings.karusellenItemClass;	
				}
				item.style.width = size.itemWidth + '%';
				item.style.float = self.settings.itemFloatDirection;

				
				self.karusellenContent.appendChild(item);
			});

			if(karusellenList === null){
				fragment.appendChild(this.karusellenContent);	
			}else{
				karusellenList.appendChild(this.karusellenContent);
				fragment.appendChild(karusellenList);
			}
			
			if(this.hasTouchSupport !== true){

				var control = this.createControls(),
					controlWrapper;

				if(karusellenList === null){
					controlWrapper = document.createElement('div')
				}else{
					controlWrapper = document.createElement('li');	
				}
				controlWrapper.className = this.settings.buttonsWrapperClass;
				controlWrapper.appendChild(control.prev);
				controlWrapper.appendChild(control.next);
				fragment.appendChild(controlWrapper);
			}
			
			this.referenceObj.original.innerHTML = '';
			this.referenceObj.original.style.width = 100 + '%';
			
			if(this.hasTouchSupport){
				this.referenceObj.original.style.overflowX = 'auto';
				this.referenceObj.original.style.overflowY = 'hidden';
				this.referenceObj.original.style.WebkitOverflowScrolling = 'touch';
			}else{
				this.referenceObj.original.style.overflow = 'hidden';
			}
			
			this.referenceObj.original.appendChild(fragment);
		},

		createEvent: function(button){
			
			var self = this;

			button.addEventListener('click', function(){
				
				if(hasClass(this, self.settings.prevButtonClass)){
					self.updateIndex('prev');
				}else if(hasClass(this, self.settings.nextButtonClass)){
					self.updateIndex('next');
				}

			});
		},

		updateIndex: function(direction){
			
			switch(direction){
				
				case 'prev':
					if(this.currentSlide === 0){
						this.currentSlide = (this.amountOfItems - 1);
					}else{
						this.currentSlide = (this.currentSlide - 1);
					}
					break;
				case 'next':
					if(this.currentSlide === (this.amountOfItems - 1)){
						this.currentSlide = 0;
					}else{
						this.currentSlide = (this.currentSlide + 1);
					}
					break;
				default: 
					throw new Error('direction is not valid');

			}
			this.makeItSpin();
		},

		makeItSpin: function(){
			var self = this,
				translateValue;

			if(this.currentSlide === 0){
				translateValue = 0;
			}else{
				translateValue = ((this.currentSlide/this.amountOfItems) * 100);
			}
			this.karusellenContent.style.webkitTransform = 'translateX(-'+translateValue+'%)';
			this.karusellenContent.style.transform = 'translateX(-'+translateValue+'%)';
			
		},

		getCarouselSize: function(){

			var carouselWidth = ((100*this.amountOfItems)/this.settings.itemsToShow);
			var itemWidth = (100/this.amountOfItems);
				
			var size = {
				carouselWidth: carouselWidth,
				itemWidth: itemWidth
			}
			return size;
		},

		createControls: function(){
			var prevButton = document.createElement('button');
			var nextButton = document.createElement('button');
			prevButton.type = 'button';
			prevButton.className = this.settings.buttonClass+' '+this.settings.prevButtonClass;
			prevButton.innerHTML = this.settings.prevButtonInnerHTML;
			nextButton.type = 'button';
			nextButton.className = this.settings.buttonClass+' '+this.settings.nextButtonClass;
			nextButton.innerHTML = this.settings.nextButtonInnerHTML;

			this.createEvent(prevButton);
			this.createEvent(nextButton);

			var control = {
				prev: prevButton,
				next: nextButton
			}
			return control;
		}
	};

	var hasClass = function(element, classname){

		var classes = element.getAttribute("class").split(' '),
			regexp = new RegExp("\\b"+classname+"\\b"),
			hasclass = false;

			if(element.className.match(regexp)){
				hasclass = true;
			}
			return hasclass;
	};

	var squash = function(target, source){
		var targetObj = Object.create(target);
		Object.keys(source).map(function(property){
			property in targetObj && (targetObj[property] = source[property]);
		});
		return targetObj;
	};

	window.Karusellen = Karusellen;

}(this));