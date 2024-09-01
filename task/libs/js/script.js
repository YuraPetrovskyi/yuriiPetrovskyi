$(window).on('load', function () {
	if ($('#preloader').length) {
			$('#preloader').delay(1000).fadeOut('slow', function () {
					$(this).remove();
			});
	}
});

$(document).ready(function() {
	$('#submitCitySearch').click(function() {
			const cityName = $('#cityParam').val().trim();
			
			if (cityName === '') {
					$('#cityErrorMsg').text('Please enter a capital city name.');
					$('#txtCityName').html('None');
					$('#txtCountryName').html('None');
					$('#txtPopulation').html('None');
					$('#txtLatitude').html('None');
					$('#txtLongitude').html('None');
					return;
			}

			$.ajax({
					url: 'libs/php/getCityInfo.php',
					method: 'POST',
					data: { city: cityName },
					success: function(data) {
							console.log('start City search', data);
							if (data.status.name === "ok" && data.data.length > 0) {
									$('#txtCityName').html(data['data'][0]['name']);
									$('#txtCountryName').html(data['data'][0]['countryName']);
									$('#txtPopulation').html(data['data'][0]['population']);
									$('#txtLatitude').html(data['data'][0]['lat']);
									$('#txtLongitude').html(data['data'][0]['lng']);
									$('#cityErrorMsg').text(''); 
							} else {
									$('#txtCityName').html('None');
									$('#txtCountryName').html('None');
									$('#txtPopulation').html('None');
									$('#txtLatitude').html('None');
									$('#txtLongitude').html('None');
									$('#cityErrorMsg').text('No results found for the specified city.');
							}
					},
					error: function() {
							$('#txtCityName').html('None');
							$('#txtCountryName').html('None');
							$('#txtPopulation').html('None');
							$('#txtLatitude').html('None');
							$('#txtLongitude').html('None');
							$('#cityErrorMsg').text('Error occurred while fetching data.');
					}
			});
	});

	$('#submitTimezoneSearch').click(function() {
			const lat = $('#latParam').val().trim();
			const lng = $('#lngParam').val().trim();

			if (lat === '' || lng === '') {
					$('#timezoneErrorMsg').text('Please enter both latitude and longitude.');
					$('#txtTimezoneId').html('None');
					$('#txtTimezoneCountry').html('None');
					$('#txtLocalTime').html('None');
					$('#txtSunrise').html('None');
					$('#txtSunset').html('None');
					return;
			}

			$.ajax({
					url: 'libs/php/getTimeZoneInfo.php',
					method: 'POST',
					data: { lat: lat, lng: lng },
					success: function(data) {
						console.log('start Timezone search', data);
							if (data.status.name === "ok") {
									$('#txtTimezoneId').html(data['data']['timezoneId']);
									$('#txtTimezoneCountry').html(data['data']['countryName']);
									$('#txtLocalTime').html(data['data']['time']);
									$('#txtSunrise').html(data['data']['sunrise']);
									$('#txtSunset').html(data['data']['sunset']);
									$('#timezoneErrorMsg').text('');
							} else {
									$('#txtTimezoneId').html('None');
									$('#txtTimezoneCountry').html('None');
									$('#txtLocalTime').html('None');
									$('#txtSunrise').html('None');
									$('#txtSunset').html('None');
									$('#timezoneErrorMsg').text(data.status.description || 'No timezone data found for the provided coordinates.');
							}
					},
					error: function() {
							$('#txtTimezoneId').html('None');
							$('#txtTimezoneCountry').html('None');
							$('#txtLocalTime').html('None');
							$('#txtSunrise').html('None');
							$('#txtSunset').html('None');
							$('#timezoneErrorMsg').text('Error occurred while fetching data.');
					}
			});
	});

	$('#submitWeatherSearch').click(function() {
			const lat = $('#weatherLat').val().trim();
			const lng = $('#weatherLng').val().trim();

			if (lat === '' || lng === '') {
					$('#weatherErrorMsg').text('Please enter both latitude and longitude.');
					$('#txtStationName').html('None');
					$('#txtTemperature').html('None');
					$('#txtHumidity').html('None');
					$('#txtWindSpeed').html('None');
					$('#txtClouds').html('None');
					return;
			}

			$.ajax({
					url: 'libs/php/getWeatherInfo.php',
					method: 'POST',
					data: { lat: lat, lng: lng },
					success: function(data) {
						console.log('start Wather search', data);
							if (data.status.name === "ok" && data.data.weatherObservation) {
									$('#txtStationName').html(data.data.weatherObservation.stationName);
									$('#txtTemperature').html(data.data.weatherObservation.temperature + "°C");
									$('#txtHumidity').html(data.data.weatherObservation.humidity + "%");
									$('#txtWindSpeed').html(data.data.weatherObservation.windSpeed + " km/h");
									$('#txtClouds').html(data.data.weatherObservation.clouds);
									$('#weatherErrorMsg').text('');
							} else {
									$('#txtStationName').html('None');
									$('#txtTemperature').html('None');
									$('#txtHumidity').html('None');
									$('#txtWindSpeed').html('None');
									$('#txtClouds').html('None');
									$('#weatherErrorMsg').text('No weather data found for the provided coordinates.');
							}
					},
					error: function() {
							$('#txtStationName').html('None');
							$('#txtTemperature').html('None');
							$('#txtHumidity').html('None');
							$('#txtWindSpeed').html('None');
							$('#txtClouds').html('None');
							$('#weatherErrorMsg').text('Error occurred while fetching data.');
					}
			});
	});
});
