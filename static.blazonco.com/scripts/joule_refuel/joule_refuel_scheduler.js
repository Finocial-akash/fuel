YAHOO.util.Event.onDOMReady( function() {
	Blazonco.JouleRefuel = ( function() {

		if( !Array.prototype.indexOf )
			Array.prototype.indexOf = function( search, idx ) {
				var x = ( !idx ) ? 0 : Math.abs( idx ),
					l = this.length;

				if( idx < 0 ) x = l - x;

				if( x > 0 )
					for( null; x < l; x++ )
						if( this[x] === search )
							return x;

				return -1;
			};

		var sendAlert = function( msg ) {
				window.alert( msg );
			},

			getRadioValue = function( name ) {
				var rEls = document.getElementsByName( name ),
					x = 0, l;

				if( rEls )
					for( l = rEls.length; x < l; x++ )
						if( rEls[x].checked )
							return rEls[x].value;

				return null;
			},

			setFuelTypeSelect = function( fuelTypes ) {
				var selectEl = document.getElementById( 'refuel_schedule:fuel_type' ),
					optionEls = selectEl.children,
					l = optionEls.length,
					hide = false, x, c;

				if( !fuelTypes ) {
					for( x = 1; x < l; x++ ) {
						optionEls[x].disabled = hide;
						optionEls[x].style.display = '';
					}
				}
				else if( fuelTypes instanceof Array ) {
					c = fuelTypes.length;

					for( x = 1; x < l; x++ ) {
						hide = ( c > 0 && fuelTypes.indexOf( optionEls[x].value ) < 0 );

						optionEls[x].disabled = hide;
						optionEls[x].style.display = ( hide ) ? 'none' : '';
					}

					if( c === 1 )
						selectEl.value = fuelTypes[0];
				}
			},

			Form = {
				_el: document.getElementById( 'RefuelScheduleForm' ),
				_sections: [

					// User Info
					{ id: 'RefuelUserSection',     _validate: function() {
						var fields = [ 'first_name', 'last_name', 'email_address', 'password', 'confirm' ],
							prefix = 'user_account:',
							elements = {}, l = fields.length, x = 0, el, ret = true;

						for( null; x < l; x++ ) {
							el = document.getElementById( prefix + fields[x] );

							if( el ) {
								if( !el.value ) {
									sendAlert( 'One or more required fields have not been entered yet.' );
									return false;
								}
								elements[fields[x]] = el;
							}
						}

						if( elements.password.value.length < 6 ) {
							sendAlert( 'Passwords should be at least 6 characters long for security purposes.' );
							return false;
						}

						if( elements.password.value !== elements.confirm.value ) {
							sendAlert( 'Passwords entered do not match!' );
							return false;
						}

						YAHOO.util.Connect.asyncRequest( 'post', '/refuel_schedule/check_email_address', {
							success: function( o ) {
								if( YAHOO.lang.JSON.parse( o.responseText ) == true )
									Form.nextSection( true );
								else
									sendAlert( 'A user with this email address already exists. Please login first or try another email address.' );
							},
							failure: function() {
								sendAlert( 'Unable to verify your e-mail address at this time. Please refresh and try again, or contact the site administrator if the problem persists.' );
							}
						}, 'email=' + elements.email_address.value );

						return false;
					} },

					// Vehicle Info
					{ id: 'RefuelVehicleSection', _validate: function() {
						var vehicleId = getRadioValue( 'user_vehicle:id' ),
							fuelParams = [];

						if( !vehicleId ) {

							if( !document.getElementById( 'VehicleNotFound' ).checked ) {
								var fields = [ 'year', 'make', 'model' ],
									prefix = 'user_vehicle:',
									l = fields.length, x = 0, el;

								for( null; x < l; x++ ) {
									el = document.getElementById( prefix + fields[x] );

									if( el ) {
										if( el.value == 'NO_OPTION' ) {
											sendAlert( 'One or more required vehicle fields have not been selected yet.' );
											return false;
										}
										else
											fuelParams.push( el.id + '=' + el.value );
									}
								}
							}
							else {
								if( !document.getElementById( 'user_vehicle:description' ).value ) {
									sendAlert( 'A vehicle description is required if your vehicle can not be found in the selection menu.' );
									return false;
								}
							}

							if( !document.getElementById( 'user_vehicle:license_plate' ).value ) {
								sendAlert( 'License Plate number is required to positively identify your vehicle.' );
								return false;
							}
						}
						else
							fuelParams.push( 'user_vehicle:id=' + vehicleId );

						/* Vehicle-Specific Fuel Type Filtering
						 if( fuelParams.length > 0 )
						 YAHOO.util.Connect.asyncRequest( 'post', '/secure_auth/getVehicleFuelTypes', {
						 success: function( o ) {
						 setFuelTypeSelect( YAHOO.lang.JSON.parse( o.responseText ) );
						 },
						 failure: function() {
						 setFuelTypeSelect();
						 }
						 }, fuelParams.join( '&' ) );
						 else
						 setFuelTypeSelect();
						 */

						return true;
					} },

					// Address Info
					{ id: 'RefuelAddressSection',  _validate: function() {
						if( !getRadioValue( 'shipping_address:shipping_address_id' ) ) {
							var fields = [ 'first_name', 'last_name', 'phone_number', 'address', 'city', 'state', 'zip' ],
								prefix = 'shipping_address:',
								l = fields.length, x = 0, el;

							for( null; x < l; x++ ) {
								el = document.getElementById( prefix + fields[x] );

								if( el ) {
									if( !el.value ) {
										sendAlert( 'One or more required fields have not been entered yet.' );
										return false;
									}
								}
							}
						}
						return true;
					} },

					// Billing Info
					{ id: 'RefuelBillingSection',  _validate: function() {
						if( !getRadioValue( 'billing_account:payment_profile_id' ) ) {
							var fields = [ 'first_name', 'last_name', 'phone_number', 'address', 'city', 'state', 'zip', 'card_number', 'exp_month', 'exp_year', 'cvv' ],
								prefix = 'billing_account:',
								l = fields.length, x = 0, el;

							for( null; x < l; x++ ) {
								el = document.getElementById( prefix + fields[x] );

								if( el ) {
									if( !el.value ) {
										sendAlert( 'One or more required fields have not been entered yet.' );
										return false;
									}
								}
							}
						}
						return true;
					} },

					// Schedule Info
					{ id: 'RefuelScheduleSection',  _validate: function() {
						var dateEl = document.getElementById( 'refuel_schedule:start_date' ),
							timeEl = document.getElementById( 'refuel_schedule:timeframe' ),
							fuelEl = document.getElementById( 'refuel_schedule:fuel_type' ),
							date;

						if( !dateEl.value )
							sendAlert( 'Please enter the requested date of refuel.' );

						if( !timeEl.value )
							sendAlert( 'Please select a timeframe for delivery.' );

						if( !fuelEl.value )
							sendAlert( 'Please select which fuel type you would like.' );

						date = new Date( dateEl.value );

						if( isNaN( date ) ) {
							sendAlert( 'Invalid date format, please use MM/DD/YYYY format.' );
							return false;
						}
						else if( date < new Date() ) {
							sendAlert( 'Same-Day delivery is currently unavailable, please choose a later date.' );
							return false;
						}
						else if( date.getDay() === 0 || date.getDay() === 6 ) {
								sendAlert( 'Sorry, not available on weekends, Monday through Friday deliveries only.' );
								return false;
							}

						YAHOO.util.Connect.asyncRequest( 'post', '/refuel_schedule/check_schedule', {
							success: function( o ) {
								if( YAHOO.lang.JSON.parse( o.responseText ) != true )
									sendAlert( 'Unfortunately, this time slot full. Please try another time or select a different day.' );
								else
									Form.submit();
							},
							failure: function() {
								sendAlert( 'Unable to verify schedules at this time, please refresh and try again or contact support if the error persists.' );
							}
						}, 'schedule:start_date=' + dateEl.value + '&schedule:timeframe=' + timeEl.value );

						return false;
					} }
				],

				_stepUlEl: document.getElementById( 'RefuelSteps' ),
				_stepEls: document.querySelectorAll( 'ul#RefuelSteps li' ),

				_idx: 0,
				_length: 0,
				sections: [],

				_showSection: function( section ) {
					if( section ) {
						section.el.style.display = '';
						return true;
					}
					return false;
				},

				_hideSection: function( section ) {
					if( section ) {
						section.el.style.display = 'none';
						return true;
					}
					return false;
				},

				nextSection: function( no_validation ) {
					var section = this.sections[this._idx];

					if( section ) {
						if( section.validate && !no_validation )
							if( !section.validate() )
								return false;

						if( this._idx + 1 === this._length )
							this.submit();
						else {
							this._stepEls[this._idx].className = '';
							this._stepEls[this._idx + 1].className = 'active';
							this._idx++;

							this._hideSection( section );
							this._showSection( this.sections[this._idx] );
						}
					}
					return false;
				},

				prevSection: function() {
					var section = this.sections[this._idx];

					if( section ) {

						if( this._idx !== 0 ) {

							this._stepEls[this._idx].className = '';
							this._stepEls[this._idx - 1].className = 'active';
							this._idx--;

							this._hideSection( section );
							this._showSection( this.sections[this._idx] );
						}
					}
					return false;
				},

				submit: function() {
					this._el.submit();
				},

				init: function() {
					var l = this._sections.length, x = 0, el, section;

					for( null; x < l; x++ ) {
						el = document.getElementById( this._sections[x].id );

						if( el ) {
							section = {
								id: this._sections[x].id,
								el: el
							};

							if( typeof this._sections[x]._validate == 'function' )
								section.validate = this._sections[x]._validate;

							this.sections.push( section );
						}
					}
					this._length = this.sections.length;
				}
			},

			Calendar = {
				_active: null,
				_els: [],
				_dialog: new YAHOO.widget.SimpleDialog( 'DateDialog', {
					visible: false,
					modal: false,
					fixedcenter: false,
					constraintoviewport: true,
					drggable: true,
					close: true
				}),

				_cal: new YAHOO.widget.Calendar( 'DateCal', 'DatePicker', {
					mindate: new Date( ( Date.now ? Date.now() : ( new Date() ).getTime() ) + 86400000 )
				} ),

				// Keeps calender up with input el (and validates)
				syncCalendarView: function( el ) {
					var d = new Date( el.value );

					if( !isFinite( d ) ) {
						el.value = el.placeholder;
						d = new Date( el.value );
					}

					this._cal.cfg.setProperty( 'selected', el.value );
					this._cal.setMonth( d.getMonth() ); this._cal.setYear( d.getFullYear() );
					this._cal.render();
				},

				init: function( els ) {
					if( els instanceof Array )
						this._els = this._els.concat( els );
					else
						this._els.push( els );

					this._dialog.render();
					this._cal.render();

					YAHOO.util.Event.addListener( this._els, 'focus', function( e ) {
						this._active = ( e.element ) ? e.element() : e.target || e.srcElement;

						this.syncCalendarView( this._active );

						this._dialog.cfg.setProperty( 'context', [ this._active, 'tl', 'tr', [ 'beforeShow', 'windowResize' ], [ 30, -100 ] ] );
						this._dialog.show();
					}.bind( this ) );

					this._cal.selectEvent.subscribe( function( e, o ) {
						o = o[0][0];

						var date = [
							( o[1] < 10 ) ? '0' + o[1] : o[1],
							( o[2] < 10 ) ? '0' + o[2] : o[2],
							o[0]
						];
						this._active.value = date.join( 'index.html' );
						this._dialog.hide();
					}.bind( this ) );
				}
			},

			init = function() {

				Form.init();
				Calendar.init( 'refuel_schedule:start_date' );

				YAHOO.util.Event.addListener( Form._el.querySelectorAll( 'button.next-button' ), 'click', function() { Form.nextSection(); } );
				YAHOO.util.Event.addListener( Form._el.querySelectorAll( 'button.back-button' ), 'click', function() { Form.prevSection(); } );

				YAHOO.util.Event.addListener( 'GoToAccBtn', 'click', function() { window.location.href = 'secure_auth/account.html'; } );

				YAHOO.util.Event.addListener( document.getElementsByName( 'refuel_schedule:recurring' ), 'click', function( e ) {
					var el = ( e.element ) ? e.element() : e.target || e.srcElement,
						hide = !( el.checked && el.value === '1' );

					document.getElementById( 'refuel_schedule:interval' ).disabled = hide;
					document.getElementById( 'ScheduleIntervalLabel' ).style.visibility = ( hide ) ? 'hidden' : '';
				});

				var vehicleOpts = document.querySelectorAll( '#RefuelVehicleSection select' ),
					vNotFoundEl = document.getElementById( 'VehicleNotFound' ),

					createOption = function( text, value ) {
						var optEl = document.createElement( 'option' );

						if( !value ) value = text;

						optEl.appendChild( document.createTextNode( text ) );
						optEl.value = value;

						return optEl;
					},

					resetSelectField = function( el ) {
						while( el.firstChild )
							el.removeChild( el.firstChild );

						var type = el.id.replace( 'user_vehicle:', '' );
						type = type.substr( 0, 1 ).toUpperCase() + type.substr( 1 );

						el.appendChild( createOption( 'Select ' + type + '...', 'NO_OPTION' ) );
						el.value = 'NO_OPTION';

						el.disabled = true;
					},

					fireSelectChangeEvent = function( selectEl ) {
						if( 'createEvent' in document ) {
							var event = document.createEvent( 'HTMLEvents' );
							event.initEvent( 'change', false, true );
							selectEl.dispatchEvent( event );
						}
						else
							selectEl.fireEvent( 'onchange' );
					},

					fillSelectOptions = function( el, options ) {
						var l = options.length, x;

						resetSelectField( el );

						if( l > 0 ) {
							if( l === 1 ) {
								el.appendChild( createOption( options[0] ) );
								el.value = options[0];

								fireSelectChangeEvent( el );
							}
							else
								for( x = 0; x < l; x++ )
									el.appendChild( createOption( options[x] ) );
						}
						else {
							el.appendChild( createOption( 'No Options Listed', '' ) )
							el.value = '';

							fireSelectChangeEvent( el );
						}

						el.disabled = false;
					};

				YAHOO.util.Event.addListener( vehicleOpts, 'change', function( e ) {
					var el = ( e.element ) ? e.element() : e.target || e.srcElement,
						l = vehicleOpts.length, params = [], ready = false, nextEl, x;

					for( x = 0; x < l; x++ ) {
						if( !ready ) {
							params.push( vehicleOpts[x].id.replace( 'user_vehicle:', '' ) + '=' + vehicleOpts[x].value );

							if( vehicleOpts[x].id === el.id ) {
								ready = true;

								if( x + 1 !== l )
									nextEl = vehicleOpts[x+1];
							}
						}
						else
							resetSelectField( vehicleOpts[x] );
					}

					if( ready ) {
						if( nextEl ) {
							YAHOO.util.Connect.asyncRequest( 'post', '/secure_auth/getVehicleMenuOptions', {
								success: function( o ) {
									fillSelectOptions( nextEl, YAHOO.lang.JSON.parse( o.responseText ) );
								},
								failure: function( o ) {
									Blazonco.Vehicles.Alert( YAHOO.lang.JSON.parse( o.responseText ) );
								}
							}, params.join( '&' ) );
						}
					}
				} );

				YAHOO.util.Event.addListener( vNotFoundEl, 'click', function() {
					if( vNotFoundEl.checked ) {
						for( var x = 1, l = vehicleOpts.length; x < l; x++ )
							resetSelectField( vehicleOpts[x] );

						vehicleOpts[0].value = 'NO_OPTION';
						vehicleOpts[0].disabled = true;
					}
					else
						vehicleOpts[0].disabled = false;
				});
				/*
				 YAHOO.util.Event.addListener( document.getElementsByName( 'user_vehicle:id' ), 'change', function( e ) {
				 var el = ( e.element ) ? e.element() : e.target || e.srcElement;

				 document.getElementById( 'AddNewVehicleForm' ).style.display = ( !el.value ) ? null : 'none';
				 });

				 YAHOO.util.Event.addListener( document.getElementsByName( 'shipping_address:shipping_address_id' ), 'change', function( e ) {
				 var el = ( e.element ) ? e.element() : e.target || e.srcElement,
				 show = ( !el.value );

				 document.getElementById( 'AddNewAddressForm' ).style.display = ( show ) ? null : 'none';
				 document.getElementById( 'SameAsDeliveryLabel' ).style.display = ( show ) ? null : 'none';
				 });

				 YAHOO.util.Event.addListener( document.getElementsByName( 'billing_account:payment_profile_id' ), 'change', function( e ) {
				 var el = ( e.element ) ? e.element() : e.target || e.srcElement,
				 show = ( !el.value );

				 document.getElementById( 'AddNewAccountForm' ).style.display = ( show ) ? null : 'none';
				 document.getElementById( 'AddCreditCardForm' ).style.display = ( show ) ? null : 'none';
				 });
				 */
				YAHOO.util.Event.addListener( document.querySelectorAll( '#RefuelVehicleSection tbody td' ), 'click', function( e ) {
					var el = ( e.element ) ? e.element() : e.target || e.srcElement,
						vehicleForm = document.getElementById( 'AddNewVehicleForm' ),
						radioEl;

					if( el.tagName.toLowerCase() == 'input' )
						radioEl = el;
					else if( el.tagName.toLowerCase() == 'label' )
						radioEl = el.previousElementSibling;
					else
						radioEl = el.parentElement.firstElementChild.firstElementChild;

					radioEl.checked = true;
					vehicleForm.style.display = ( !radioEl.value ) ? '' : 'none';
				} );

				YAHOO.util.Event.addListener( document.querySelectorAll( '#RefuelAddressSection tbody td' ), 'click', function( e ) {
					var el = ( e.element ) ? e.element() : e.target || e.srcElement,
						addressForm = document.getElementById( 'AddNewAddressForm' ),
						deliveryLabel = document.getElementById( 'SameAsDeliveryLabel' ),
						radioEl;

					if( el.tagName.toLowerCase() == 'input' )
						radioEl = el;
					else if( el.tagName.toLowerCase() == 'label' )
						radioEl = el.previousElementSibling;
					else
						radioEl = el.parentElement.firstElementChild.firstElementChild;

					radioEl.checked = true;
					addressForm.style.display = ( !radioEl.value ) ? '' : 'none';
					deliveryLabel.style.display = ( !radioEl.value ) ? '' : 'none';
				} );

				YAHOO.util.Event.addListener( document.querySelectorAll( '#RefuelBillingSection tbody td' ), 'click', function( e ) {
					var el = ( e.element ) ? e.element() : e.target || e.srcElement,
						accountForm = document.getElementById( 'AddNewVehicleForm' ),
						cardForm = document.getElementById( 'AddCreditCardForm' ),
						radioEl;

					if( el.tagName.toLowerCase() == 'input' )
						radioEl = el;
					else if( el.tagName.toLowerCase() == 'label' )
						radioEl = el.previousElementSibling;
					else
						radioEl = el.parentElement.firstElementChild.firstElementChild;

					radioEl.checked = true;
					accountForm.style.display = ( !radioEl.value ) ? '' : 'none';
					cardForm.style.display = ( !radioEl.value ) ? '' : 'none';
				} );

				YAHOO.util.Event.addListener( document.getElementById( 'SameAsDelivery' ), 'change', function( e ) {
					var el = ( e.element ) ? e.element() : e.target || e.srcElement,
						fields = [ 'first_name', 'last_name', 'company', 'address', 'city', 'state', 'zip', 'phone_number' ],
						billPrefix = 'billing_account:',
						addrPrefix = 'shipping_address:',
						l = fields.length,
						x = 0, billEl, addrEl;

					for( null; x < l; x++ ) {
						billEl = document.getElementById( billPrefix + fields[x] );

						if( el.checked ) {
							addrEl = document.getElementById( addrPrefix + fields[x] );

							billEl.value = addrEl.value;
							billEl.readOnly = true;
						}
						else
							billEl.readOnly = false;
					}
				});

				YAHOO.util.Event.addListener( [ 'user_account:first_name', 'user_account:last_name' ], 'change', function( e ) {
					var el = ( e.element ) ? e.element() : e.target || e.srcElement,
						fieldName = el.name.replace( 'user_account:', '' ),
						billEl, addrEl;

					if( el.value ) {
						billEl = document.getElementById( 'billing_account:' + fieldName );
						addrEl = document.getElementById( 'shipping_address:' + fieldName );

						if( !billEl.value )
							billEl.value = el.value;

						if( !addrEl.value )
							addrEl.value = el.value;
					}
				});
			};

		return { Form: Form, Calendar: Calendar, Alert: sendAlert, init: init };
	} )()
} );
