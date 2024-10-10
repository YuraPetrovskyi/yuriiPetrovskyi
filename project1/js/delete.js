{/* <nav class="navbar navbar-expand-lg bg-warning">
      <div class="container-fluid justify-content-center p-1">
        <ul class="navbar-nav">
          <li class="nav-item">
            <!-- Country selection button -->
            <button id="selectCountryButton" class="btn btn-outline-success">
              Country
            </button>    
            <!-- A container for the search field and the list of countries -->
            <div id="countrySelectContainer" class="d-none position-absolute bg-light p-3 shadow" style="z-index: 1000; width: 240px; top: 60px;">
              <!-- Country search field -->
              <input id="countrySearchInput" class="form-control mb-2" type="text" placeholder="Search for a country">
              <!-- List of countries -->
              <ul id="countrySelect" class="list-group" style="max-height: 300px; overflow-y: auto;">
                <!-- Country options will load dynamically -->
              </ul>
              <!-- Button to close the list of countries -->
              <button id="closeCountrySelect" class="btn btn-outline-danger mt-2 w-100">Close</button>
            </div>
          </li>          
        </ul>
        <!-- Field for displaying the current country, saving the ISO code -->
        <span id="currentCountry" class="navbar-text fs-4 ms-3 text-success fw-bold text-uppercase p-0" data-country-iso="" data-curency-code=""></span>
      </div>
    </nav> */}



    getCountryByCoordinates(lat, lon)
        .then(data => {
            // console.log('getCountryByCoordinates data ', data);
            setCoutryTitle(data.countryName, data.countryISO)
            setCountryInform(data.countryISO);
        })
        .catch(error => {
            // console.error('Error fetching country by coordinates:', error);
            showBootstrapAlert('Sorry for the inconvenience, something went wrong with the server.', 'danger');
        })

    // add handlers for opening/closing the list of countries
    // document.getElementById('selectCountryButton').addEventListener('click', toggleCountrySearch);
    // document.getElementById('closeCountrySelect').addEventListener('click', toggleCountrySearch);

    // filtering countries by the entered text
    // document.getElementById('countrySearchInput').addEventListener('input', function() {
    //     const name = this.value.toLowerCase();
    //     const listItems = document.querySelectorAll('#countrySelect li'); // get all <li> for filtering
    //     filterCountryNames(name, listItems);
    // });

    function addCountrySelectEventListener() {
      const listItems = document.querySelectorAll('#countrySelect li'); // get all <li> elements
      listItems.forEach(listItem => {
          listItem.addEventListener('click', function() {
              const countryName = this.textContent;
              const isoCode = this.getAttribute('data-value');
  
              // update the display of the selected country
              document.getElementById('currentCountry').textContent = countryName;
              document.getElementById('currentCountry').setAttribute('data-country-iso', isoCode);
  
              // download information and borders for the selected country
              getCountrySpecificBorders(isoCode, map, countryBorderLayerRef);
              setCountryInform(isoCode);
  
              // close the list after selection
              toggleCountrySearch();
          });
      });
  }
  