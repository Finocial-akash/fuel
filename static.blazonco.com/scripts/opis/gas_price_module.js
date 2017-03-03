YAHOO.util.Event.onDOMReady( function() {
	var els = document.querySelectorAll( '.gas-price-module' ),

		Spinner = {
			el: null,
			overlay: null,
			deg: 0,
			handle: null,
			rotate: function() {
				this.el.style.transform = 'rotate(' + this.deg + 'deg)';
				this.deg += 30;

				if( this.deg == 360 )
					this.deg = 0;
			},
			start: function() {
				this.overlay.style.display = null;
				this.handle = setInterval( this.rotate.bind(this), 300 );
			},
			stop: function() {
				this.overlay.style.display = 'none';
				clearInterval( this.handle );
				this.deg = 0;
			},
			init: function() {
				var spacer = document.createElement( 'div' );

				this.el = document.createElement( 'img' );
				this.el.src = '../static.blazonco.com/stylesheets/opis/images/spinner.png';
				this.overlay = document.createElement( 'div' );

				this.el.style.cssText = 'display: inline-block; vertical-align: middle;';
				this.overlay.style.cssText = 'display: none; position: fixed; top: 0; bottom: 0; left: 0; right: 0; text-align: center; z-index: 999; background-color: rgba( 0, 0, 0, 0.3 );';
				spacer.style.cssText = 'display: inline-block; vertical-align: middle; height: 100%;';

				this.overlay.appendChild( spacer );
				this.overlay.appendChild( this.el );

				document.body.appendChild( this.overlay );
			}
		},

		initGasPriceModule = function( modEl ) {
			var Module = {
				el: modEl,

				searchEl: modEl.querySelector( '.search-zip' ),
				locEl:    modEl.querySelector( '.current-location' ),
				zipEl:    modEl.querySelector( '.zip-field' ),
				backEl:   modEl.querySelector( '.go-back' ),

				searchZip: function() {
					if( this.zipEl.value.length < 5 || !/[0-9]{5}/.test( this.zipEl.value ) )
						this.zipEl.focus();
					else {
						this.getPrices( this.zipEl.value );
						Spinner.start();
					}
				},

				searchLoc: function() {
					if( 'geolocation' in navigator ) {
						navigator.geolocation.getCurrentPosition( this.getZipCode.bind(this), function() { Spinner.stop(); window.alert( 'Geolocation Unavailable.' ); }, { enableHighAccuracy: true, maximumAge: 0 } );
						Spinner.start();
					}
					else
						window.alert( 'Geolocation is not available on this browser or device.' );
				},

				setPrices: function( o ) {
					var res = YAHOO.lang.JSON.parse( o.responseText ),
						fields = [ 'unleaded', 'midgrade', 'premium', 'diesel' ],
						zipCode = this.el.querySelector( '.zip-code' ),
						fieldEl, label, i, c;

					this.replaceTextNode( zipCode, res.zip_code );

					if( res.success ) {
						for( i = 0, c = fields.length; i < c; i++ ) {
							fieldEl = this.el.querySelector( '.' + fields[i] );

							if( fieldEl ) {
								if( res[fields[i]] ) {
									label = ( fields[i] != 'unleaded' ) ? fields[i].charAt(0).toUpperCase() + fields[i].substr(1) : 'Regular';
									this.replaceTextNode( fieldEl, res[fields[i]] + ' ' + label );
								}
								else
									this.replaceTextNode( fieldEl, '' );
							}
						}

						this.showPrices( true );
					}
					else
						this.showPrices( false );
				},

				showPrices: function( hasResults ) {
					var step1 = this.el.querySelector( '.GasPriceStep1' ),
						step2 = this.el.querySelector( '.GasPriceStep2' ),
						resEl = this.el.querySelector( '.GasPriceResults' ),
						noResEl = this.el.querySelector( '.GasPriceNoResults' );

					step1.style.display = 'none';
					step2.style.display = null;
					resEl.style.display = ( hasResults ) ? null : 'none';
					noResEl.style.display = ( !hasResults ) ? null : 'none';

					Spinner.stop();
				},

				goBack: function() {
					var step1 = this.el.querySelector( '.GasPriceStep1' ),
						step2 = this.el.querySelector( '.GasPriceStep2' ),
						resEl = this.el.querySelector( '.GasPriceResults' ),
						noResEl = this.el.querySelector( '.GasPriceNoResults' );

					this.zipEl.value = '';

					step1.style.display = null;
					step2.style.display = 'none';
					resEl.style.display = 'none';
					noResEl.style.display = 'none';
				},

				getZipCode: function( position ) {
					YAHOO.util.Connect.asyncRequest( 'post', window.location.href + '@' + this.el.id + '/getPrices', {
						success: this.setPrices,
						failure: function() {
							Spinner.stop();
						},
						scope: this
					}, 'search:latitude=' + position.coords.latitude + '&search:longitude=' + position.coords.longitude );
				},

				getPrices: function( zipCode ) {
					YAHOO.util.Connect.asyncRequest( 'post', window.location.href + '@' + this.el.id + '/getPrices', {
						success: this.setPrices,
						failure: function() {
							Spinner.stop();
						},
						scope: this
					}, 'search:zip=' + zipCode );
				},

				replaceTextNode: function( parent, insertText ) {
					while( parent.firstChild )
						parent.removeChild( parent.firstChild );

					parent.appendChild( document.createTextNode( insertText ) );
				},

				init: function() {
					var listener = new YAHOO.util.KeyListener( this.zipEl, { keys: [13] }, {
						fn: this.searchZip,
						scope: this,
						correctScope: true
					} );

					listener.enable();

					YAHOO.util.Event.addListener( this.searchEl, 'click', this.searchZip, null, this );
					YAHOO.util.Event.addListener( this.locEl,    'click', this.searchLoc, null, this );
					YAHOO.util.Event.addListener( this.backEl,   'click', this.goBack,    null, this );
				}
			};

			Module.init();
		};

	Spinner.init();

	for( var i in els )
		if( els.hasOwnProperty( i ) )
			initGasPriceModule( els[i] );
});
