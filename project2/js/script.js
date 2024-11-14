// Global variables for search query and selected filtersі
var selectedDepartment = 0;
var selectedLocation = 0;
let currentSearchQuery = "";

// Loading data when the page is first loaded
$(document).ready(function () {
  loadPersonnel();
  toggleSearchField();

  // Add an event to the tabs to activate/deactivate the search field
  $("#personnelBtn, #departmentsBtn, #locationsBtn").on("click", toggleSearchField);

    // Обробник події для поля пошуку
  $("#searchInp").on("keyup", function () {
    const query = $(this).val();
    performSearch(query);
  });

  // Search event
  $("#searchInp").on("keyup", function () {
    const query = $(this).val();
    performSearch(query);
  });

  $("#refreshBtn").click(function () {
    currentSearchQuery = "";
    selectedDepartment = 0;
    selectedLocation = 0;
    $("#searchInp").val(""); // Clear search input
    if ($("#personnelBtn").hasClass("active")) {
      loadPersonnel(); // Refresh personnel table 
    } else {
      if ($("#departmentsBtn").hasClass("active")) {
        loadDepartments(); // Refresh department table
      } else {
        loadLocations(); // Refresh location table
      }
    }
  });

  $("#filterBtn").click(function () {
    $("#filterPersonnelModal").modal("show");
  });
  // Showing the modal filter
  $("#filterPersonnelModal").on("show.bs.modal", function () {
    $.ajax({
      url: "php/getFilterOptions.php",
      type: "GET",
      dataType: "json",
      success: function (result) {
        if (result.status.code === "200") {
          const departmentSelect = $("#filterPersonnelByDepartment");
          const locationSelect = $("#filterPersonnelByLocation");

          // Clear the existing options
          departmentSelect.empty().append('<option value="0">All</option>');
          locationSelect.empty().append('<option value="0">All</option>');

          // Use DocumentFragment to create department options
          const departmentFragment = document.createDocumentFragment();
          result.data.departments.forEach(dept => {
            const option = document.createElement("option");
            option.value = dept.id;
            option.textContent = dept.name;
            departmentFragment.appendChild(option);
          });
          departmentSelect.append(departmentFragment); // Append all at once

          // Use DocumentFragment to create location options
          const locationFragment = document.createDocumentFragment();
          result.data.locations.forEach(loc => {
            const option = document.createElement("option");
            option.value = loc.id;
            option.textContent = loc.name;
            locationFragment.appendChild(option);
          });
          locationSelect.append(locationFragment); // Append all at once

          // Setting the values ​​of selectedDepartment and selectedLocation
          departmentSelect.val(selectedDepartment);
          locationSelect.val(selectedLocation);
        } else {
          $("#filterPersonnelModal").on("shown.bs.modal", function () {
            $(this).modal("hide"); 
            showNotification("Unable to load filter options!", "Error retrieving data ...");
          });
        }
      },
      error: function (error) {
        $("#filterPersonnelModal").on("shown.bs.modal", function () {
          $(this).modal("hide");
          showNotification("Unable to load filter options!", "Error retrieving data ...");
        });
      }
    });
  });

  // Resetting the filter when the modal window is closed
  $("#filterPersonnelModal").on("hidden.bs.modal", function () {
    $("#filterPersonnelForm")[0].reset();  // form reset
  });

  // Filtering logic: filter by only one criterion
  $("#filterPersonnelByDepartment").change(function () {
    selectedDepartment = $(this).val();
    if (selectedDepartment > 0) {
      selectedLocation = 0;
      $("#filterPersonnelByLocation").val(0);
    }  
    refreshAfterUpdate();
  });

  $("#filterPersonnelByLocation").change(function () {
    selectedLocation = $(this).val(); 
    if (selectedLocation > 0) {
      selectedDepartment = 0;
      $("#filterPersonnelByDepartment").val(0);
    } 
    refreshAfterUpdate();
  });

  $("#addBtn").click(function () {
    // Replicate the logic of the refresh button click to open the add modal for the table that is currently on display
    if ($("#personnelBtn").hasClass("active")) {
      $("#addPersonnelModal").modal("show");
    } else if ($("#departmentsBtn").hasClass("active")) {
      $("#addDepartmentModal").modal("show");
    } else if ($("#locationsBtn").hasClass("active")) {
      $("#addLocationModal").modal("show");
    }
  });

  // Loading departments before opening a modal window to add an employee
  $("#addPersonnelModal").on("show.bs.modal", function () {
    loadDepartmentOptions();
  });

  // Filling the list of locations before opening a modal window for adding a department
  $("#addDepartmentModal").on("show.bs.modal", function () {
    loadLocationOptions();
  });

  // Processing the "submit" event of the employee addition form
  $("#addPersonnelForm").on("submit", function (e) {
    e.preventDefault();

    const newPersonnelData = {
      firstName: $("#addPersonnelFirstName").val(),
      lastName: $("#addPersonnelLastName").val(),
      jobTitle: $("#addPersonnelJobTitle").val(),
      email: $("#addPersonnelEmail").val(),
      departmentID: $("#addPersonnelDepartment").val()
    };

    $.ajax({
      url: "php/insertPersonnel.php",
      type: "POST",
      dataType: "json",
      data: newPersonnelData,
      success: function (result) {
        const resultCode = result.status.code;
        if (resultCode === '200') {
          // $("#searchInp").val(""); // Clear search input
          $("#addPersonnelModal").modal("hide"); // close the modal window after successful addition
          // loadPersonnel(); // update the table of employees
          refreshAfterUpdate(); // Updates based on search and filter status
        } else {
          $("#addPersonnelModal").modal("hide");
          showNotification("Error adding personnel! Try to add personnel later.", "Error ...");
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#addPersonnelModal").modal("hide");
        showNotification("Oops, something went wrong with the server! Try to add personnel later.", "Error ...");
      }
    });
  });

  // Resetting the add personnel form when the modal is completely hidden
  $("#addPersonnelModal").on("hidden.bs.modal", function () {
    $("#addPersonnelForm").trigger("reset");
  });

  // Resetting the add department form when the modal is completely hidden
  $("#addDepartmentModal").on("hidden.bs.modal", function () {
    $("#addDepartmentForm").trigger("reset");
  });

  // Resetting the add location form when the modal is completely hidden
  $("#addLocationModal").on("hidden.bs.modal", function () {
    $("#addLocationForm").trigger("reset");
  });

  // Handle the "submit" event for the add department form
  $("#addDepartmentForm").on("submit", function (e) {
    e.preventDefault();

    const newDepartmentData = {
        name: $("#addDepartmentName").val(),
        locationID: $("#addDepartmentLocation").val()
    };

    $.ajax({
        url: "php/insertDepartment.php",
        type: "POST",
        dataType: "json",
        data: newDepartmentData,
        success: function (result) {
            if (result.status.code === '200') {
                $("#addDepartmentModal").modal("hide"); // Close the modal window
                loadDepartments();
            } else {
                $("#addDepartmentModal").modal("hide");
                showNotification("Error adding department! Try to add department later.", "Error ...");
            }
        },
        error: function (error) {
          $("#addDepartmentModal").modal("hide");
          showNotification("Oops, something went wrong with the server! Try to add personnel later.", "Error ...");
          // console.error("AJAX error:", error);
        }
    });
  });

  // Handle the "submit" event for the add location form
  $("#addLocationForm").on("submit", function (e) {
    e.preventDefault();

    const newLocationData = {
      name: $("#addLocationName").val()
    };

    $.ajax({
      url: "php/insertLocation.php",
      type: "POST",
      dataType: "json",
      data: newLocationData,
      success: function (result) {
        if (result.status.code === '200') {
          $("#addLocationModal").modal("hide");
          loadLocations();
        } else {
          $("#addLocationModal").modal("hide");
          showNotification("Error adding location! Try to add location later.", "Error ...");
        }
      },
      error: function (error) {
        $("#addLocationModal").modal("hide");
        showNotification("Oops, something went wrong with the server! Try to add location later.", "Error ...");
      }
    });
  });


  $("#personnelBtn").click(function () {
    $("#filterBtn").attr("disabled", false);
    loadPersonnel(); // Call function to refresh personnel table
  });

  $("#departmentsBtn").click(function () {
    $("#filterBtn").attr("disabled", true);
    loadDepartments(); // Call function to refresh department table
  });

  $("#locationsBtn").click(function () {
    $("#filterBtn").attr("disabled", true);
    loadLocations(); // Call function to refresh location table
  });

  $("#editPersonnelModal").on("show.bs.modal", function (e) {
    $("#editPersSaveButton").removeClass("d-none");
    $("#editPersonnelModal .modal-title").text("Edit employee");
    
    $.ajax({
      url: "php/getPersonnelByID.php",
      type: "POST",
      dataType: "json",
      data: {
        // Retrieve the data-id attribute from the calling button
        // see https://getbootstrap.com/docs/5.0/components/modal/#varying-modal-content
        // for the non-jQuery JavaScript alternative
        id: $(e.relatedTarget).attr("data-id") 
      },
      success: function (result) {
        // console.log('editPersonnelModal result:', result)
        const resultCode = result.status.code;

        if (resultCode == 200) {
          
          // Update the hidden input with the employee id so that
          // it can be referenced when the form is submitted

          $("#editPersonnelEmployeeID").val(result.data.personnel[0].id);

          $("#editPersonnelFirstName").val(result.data.personnel[0].firstName);
          $("#editPersonnelLastName").val(result.data.personnel[0].lastName);
          $("#editPersonnelJobTitle").val(result.data.personnel[0].jobTitle);
          $("#editPersonnelEmailAddress").val(result.data.personnel[0].email);

          $("#editPersonnelDepartment").html("");

          $.each(result.data.department, function () {
            $("#editPersonnelDepartment").append(
              $("<option>", {
                value: this.id,
                text: this.name
              })
            );
          });

          $("#editPersonnelDepartment").val(result.data.personnel[0].departmentID);
          
        } else {
          $("#editPersSaveButton").addClass("d-none");
          $("#editPersonnelModal .modal-title").text("Error retrieving data ...");
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        // $("#editPersonnelModal .modal-title").replaceWith("Error retrieving data");
        $("#editPersSaveButton").addClass("d-none");
        $("#editPersonnelModal .modal-title").text("Error retrieving data ...");
      }
    });
  });

  // Executes when the form button with type="submit" is clicked
  $("#editPersonnelForm").on("submit", function (e) {
    e.preventDefault();
    // Preparing data for sending
    const updatedData = {
      id: $("#editPersonnelEmployeeID").val(),
      firstName: $("#editPersonnelFirstName").val(),
      lastName: $("#editPersonnelLastName").val(),
      jobTitle: $("#editPersonnelJobTitle").val(),
      email: $("#editPersonnelEmailAddress").val(),
      departmentID: $("#editPersonnelDepartment").val()
    };

    // AJAX call to save form data
    $.ajax({
      url: "php/updatePersonnel.php",
      type: "POST",
      dataType: "json",
      data: updatedData,
      success: function (result) {
        const resultCode = result.status.code;

        if (resultCode == 200) {
          // $("#searchInp").val(""); // Clear search input
          // Close the modal window after a successful update
          $("#editPersonnelModal").modal("hide");

          // Update the employee table after making changes
          // loadPersonnel();
          refreshAfterUpdate(); // Updates based on search and filter status
        } else {
          // console.error("Error updating personnel data:", result.status.message);
          $("#editPersonnelModal").modal("hide");
          showNotification("Error editing personnel! Try to eddit personnel later.", "Error ...");
        }
      },
      error: function (error) {
        // console.error("AJAX error:", error);
        $("#editPersonnelModal").modal("hide");
        showNotification("Oops, something went wrong with the server! Try to eddit personnel later.", "Error ...");
      }
    });  
  });

  // Event to open a modal edit department window
  $("#editDepartmentModal").on("show.bs.modal", function (e) {
    const departmentId = $(e.relatedTarget).data("id");
    // console.log('departmentId', departmentId);
    $("#editDepSaveButton").removeClass("d-none");
    $("#editDepartmentModal .modal-title").text("Edit department");

    // Obtaining department data by ID
    $.ajax({
      url: "php/getDepartmentByID.php",
      type: "POST",
      dataType: "json",
      data: { id: departmentId },
      success: function (result) {
        // console.log('editDepartmentModal getDepartmentByID', result);
        const resultCode = result.status.code;
        if (resultCode === "200") {
          $("#editDepartmentID").val(result.data.department[0].id);
          $("#editDepartmentName").val(result.data.department[0].departmentName);
          $("#editDepartmentLocation").empty();

          // Adding locations to selection
          $.each(result.data.locations, function () {
            $("#editDepartmentLocation").append(
              $("<option>", {
                value: this.id,
                text: this.name
              })
            );
          });

          // Setting a value for a location
          $("#editDepartmentLocation").val(result.data.department[0].locationID);
        } else {
          // console.error("Error loading department data:", result.status.message);
          $("#editDepSaveButton").addClass("d-none");
          $("#editDepartmentModal .modal-title").text("Error retrieving data ...");
        }
      },
      error: function (error) {
        // console.error("AJAX error:", error);
        $("#editDepSaveButton").addClass("d-none"); 
        $("#editDepartmentModal .modal-title").text("Error retrieving data ...");
      }
    });
  });

  // Processing of the department editing form when pressing "SAVE"
  $("#editDepartmentForm").on("submit", function (e) {
    e.preventDefault();

    const updatedDepartmentData = {
      id: $("#editDepartmentID").val(),
      departmentName: $("#editDepartmentName").val(),
      locationID: $("#editDepartmentLocation").val()
    };

    $.ajax({
      url: "php/updateDepartment.php",
      type: "POST",
      dataType: "json",
      data: updatedDepartmentData,
      success: function (result) {
        const resultCode = result.status.code;
        if (resultCode === "200") {
          $("#editDepartmentModal").modal("hide");
          loadDepartments();
        } else {
          // console.error("Error updating department data:", result.status.message);
          $("#editDepartmentModal").modal("hide");
          showNotification("Error editing personnel! Try to eddit department later.", "Error ...");
        }
      },
      error: function (error) {
        // console.error("AJAX error:", error);
        $("#editDepartmentModal").modal("hide");
        showNotification("Oops, something went wrong with the server! Try to eddit department later.", "Error ...");
      }
    });
  });

  // Modal window for editing the location
  $("#editLocationModal").on("show.bs.modal", function (e) {
    const locationID = $(e.relatedTarget).data("id");
    // const locationName = $(e.relatedTarget).data("name");

    // Clear any previous error messages and reset the field
    $("#editLocationName").val("");

    // AJAX request to retrieve the location name by ID
    $.ajax({
      url: "php/getLocationByID.php",
      type: "POST",
      dataType: "json",
      data: { id: locationID },
      success: function (result) {
        if (result.status.code === "200") {
          // Populate the modal fields with location data
          $("#editLocationID").val(locationID);
          $("#editLocationName").val(result.data.locationName);
        } else {
          $("#editLocationModal").on("shown.bs.modal", function () {
            $(this).modal("hide"); 
            showNotification("Unable to load location data!", "Error retrieving data ...");
          });
        }
      },
      error: function () {
        $("#editLocationModal").on("shown.bs.modal", function () {
          $(this).modal("hide"); 
          showNotification("Server error while retrieving location data!", "Error retrieving data ...");
        });
      }
    });
  });

  // Processing of saving changes in the edit location form
  $("#editLocationForm").on("submit", function (e) {
    e.preventDefault();

    const updatedLocationData = {
      id: $("#editLocationID").val(),
      name: $("#editLocationName").val()
    };

    $.ajax({
      url: "php/updateLocation.php",
      type: "POST",
      dataType: "json",
      data: updatedLocationData,
      success: function (result) {
        // console.log('updateLocation.php result', result);
        const resultCode = result.status.code;
        if (resultCode === "200") {
          $("#editLocationModal").modal("hide");
          loadLocations();
        } else {
          // console.error("Error updating location:", result.status.message);
          $("#editLocationModal").modal("hide");
          showNotification("Error editing personnel! Try to eddit location later.", "Error ...");
        }
      },
      error: function (error) {
        // console.error("AJAX error:", error);
        $("#editLocationModal").modal("hide");
        showNotification("Oops, something went wrong with the server! Try to eddit location later.", "Error ...");
      }
    });
  });
  
  // Open confirmation modal for personnel deletion and fetch data
  $("#areYouSurePersonnelModal").on("show.bs.modal", function (e) {
    const personnelId = $(e.relatedTarget).data("id");

    $.ajax({
      url: "php/getPersonnelByID.php",
      type: "POST",
      dataType: "json",
      data: { id: personnelId },
      success: function (result) {
        if (result.status.code === "200") {
          $('#areYouSurePersonnelID').val(personnelId);
          $("#areYouSurePersonnelName").text(result.data.personnel[0].firstName + " " + result.data.personnel[0].lastName);
        } else {
          // showNotification("Error retrieving personnel data", "Error");
          $("#areYouSurePersonnelModal").on("shown.bs.modal", function () {
            $(this).modal("hide"); 
            showNotification("Error retrieving personnel data!", "Error retrieving data ...");
          });
        }
      },
      error: function () {
        $("#areYouSurePersonnelModal").on("shown.bs.modal", function () {
          $(this).modal("hide"); 
          showNotification("Server error retrieving personnel data!", "Error retrieving data ...");
        });
      }
    });
  });

  // Handle personnel deletion confirmation form submission
  $("#areYouSurePersonnelForm").on("submit", function (e) {
    e.preventDefault();
    const personnelId = $("#areYouSurePersonnelID").val();

    $.ajax({
      url: "php/deletePersonnelByID.php",
      type: "POST",
      dataType: "json",
      data: { id: personnelId },
      success: function (result) {
        if (result.status.code === "200") {
          $("#areYouSurePersonnelModal").modal("hide");
          // loadPersonnel(); // Refresh personnel list
          refreshAfterUpdate(); // Updates based on search and filter status
        } else {
          $("#areYouSurePersonnelModal").modal("hide");
          showNotification("Error deleting personnel.", "Error ...");
        }
      },
      error: function () {
        $("#areYouSurePersonnelModal").modal("hide");
        showNotification("Server error during personnel deletion", "Error ...");
      }
    });
  });


  // Deletion of the department with a dependency check
  $(document).on("click", ".deleteDepartmentBtn", function () {
    const departmentId = $(this).data("id");

    $.ajax({
      url: "php/checkDepartmentUse.php",
      type: "POST",
      dataType: "json",
      data: { id: departmentId },
      success: function (result) {
        // console.log('delete resole', result)
        if (result.status.code === "200") {
          if (result.data[0].personnelCount === 0) {
            $("#deleteDepartmentID").val(departmentId);
            $("#areYouSureDeptName").text(result.data[0].departmentName);
            $("#areYouSureDeleteDepartmentModal").modal("show");
          } else {
            $("#cantDeleteDeptName").text(result.data[0].departmentName);
            $("#personnelCount").text(result.data[0].personnelCount);
            $("#cantDeleteDepartmentModal").modal("show");
          }
        } else {
          showNotification("Error checking department dependencies.", "Error retrieving data ...");
        }
      },
      error: function () {
        showNotification("Server error while checking dependencies.", "Error retrieving data ...");
      }
    });
  });

  // Confirm the removal of the department
  $("#deleteDepartmentForm").on("submit", function (e) {
    e.preventDefault();
    const departmentId = $("#deleteDepartmentID").val();

    $.ajax({
      url: "php/deleteDepartmentByID.php",
      type: "POST",
      dataType: "json",
      data: { id: departmentId },
      success: function (result) {
        if (result.status.code === "200") {
          $("#areYouSureDeleteDepartmentModal").modal("hide");
          loadDepartments(); // Update the departments table
        } else {
          // alert("Error deleting department.");
          showNotification("Error deleting department.", "Error ...");
        }
      },
      error: function () {
        // alert("Server error while deleting department.");
        showNotification("Server error while deleting department.", "Error ...");
      }
    });
  });


  // Deletion of the location with a dependency check
  $(document).on("click", ".deleteLocationBtn", function () {
    const locationId = $(this).data("id");

    $.ajax({
      url: "php/checkLocationUse.php",
      type: "POST",
      dataType: "json",
      data: { id: locationId },
      success: function (result) {
        if (result.status.code === "200") {
          if (result.data[0].departmentCount === 0) {
            $("#deleteLocationID").val(locationId);
            $("#areYouSureLocName").text(result.data[0].locationName);
            $("#areYouSureDeleteLocationModal").modal("show");
          } else {
            $("#cantDeleteLocName").text(result.data[0].locationName);
            $("#departmentCount").text(result.data[0].departmentCount);
            $("#cantDeleteLocationModal").modal("show");
          }
        } else {
          showNotification("Error checking location dependencies.", "Error retrieving data ...");
        }
      },
      error: function () {
        showNotification("Server error while checking dependencies.", "Error retrieving data ...");
      }
    });
  });

  // Confirm the removal of the location
  $("#deleteLocationForm").on("submit", function (e) {
    e.preventDefault();
    const locationId = $("#deleteLocationID").val();

    $.ajax({
      url: "php/deleteLocationByID.php",
      type: "POST",
      dataType: "json",
      data: { id: locationId },
      success: function (result) {
        if (result.status.code === "200") {
          $("#areYouSureDeleteLocationModal").modal("hide");
          loadLocations(); // Update the locations table
        } else {
          showNotification("Error deleting location.", "Error ...");
        }
      },
      error: function () {
        showNotification("Server error while deleting location.", "Error ...");
      }
    });
  });

});

// ALL FUNCTIONS

// A function to update the state of the search field depending on the active tab
function toggleSearchField() {
  const activeTab = $(".nav-link.active").attr("id");
  if (activeTab === "personnelBtn") {
    $("#searchInp").prop("disabled", false);
  } else {
    $("#searchInp").prop("disabled", true).val(''); // Turn off and clear the search field
  }
}

// Function for searching based on current filters
function performSearch(query) {
  currentSearchQuery = query;

  const departmentID = selectedDepartment;
  const locationID = selectedLocation;

  $.ajax({
    url: "php/SearchAll.php",
    type: "POST",
    dataType: "json",
    data: {
      txt: query,
      departmentID: departmentID,
      locationID: locationID
    },
    success: function (result) {
      if (result.status.code === '200') {
        updatePersonnelTable(result.data.found);
      } else {
        $("#searchInp").val("");
        showNotification("Error searching! Try to search later.", "Error ...");
      }
    },
    error: function () {
      $("#searchInp").val("");
      showNotification("Oops, something went wrong with the server! Try to search later.", "Error ...");
    }
  });
}

// Updating the list taking into account the current search and filters after changes (adding, editing, deleting)
function refreshAfterUpdate() {
  if (currentSearchQuery) {
    performSearch(currentSearchQuery); // Perform a search with the current request
  } else if (selectedDepartment > 0 || selectedLocation > 0) {
    applyFilter(); // If there is an active filter
  } else {
    loadPersonnel(); // Otherwise, load all the data
  }
}

//Function for applying a filter
function applyFilter() {
  const departmentID = selectedDepartment;
  const locationID = selectedLocation;

  $.ajax({
    url: "php/filterPersonnel.php",
    type: "POST",
    dataType: "json",
    data: { departmentID, locationID },
    success: function (result) {
      if (result.status.code === "200") {
        updatePersonnelTable(result.data); // Update the table according to the filter
      } else {
        showNotification("Error applying filter. Try again later.", "Error ...");
      }
    },
    error: function (error) {
      showNotification("Server error while applying filter. Try again later.", "Error ...");
    }
  });
}

// downloading the list of departments
function loadDepartmentOptions() {
  $("#addPersonalSaveBtn").removeClass("d-none");
  $("#addPersonnelModal .modal-title").text("Add employee");

  $.ajax({
    url: "php/getAllDepartments.php",
    type: "GET",
    dataType: "json",
    success: function (result) {
      // console.log('loadDepartmentOptions', result)
      if (result.status.code === '200') {
        const departmentSelect = $("#addPersonnelDepartment");
        departmentSelect.empty(); // clear the existing options before loading

        $.each(result.data, function () {
          departmentSelect.append(
            $("<option>", {
              value: this.id,
              text: this.departmentName
            })
          );
        });
      } else {
        $("#addPersonalSaveBtn").addClass("d-none");
        $("#addPersonnelModal .modal-title").text("Error retrieving data ...");
      }
    },
    error: function (error) {
      $("#addPersonalSaveBtn").addClass("d-none");
      $("#addPersonnelModal .modal-title").text("Error retrieving data ...");
    }
  });
}

// Loading the list of locations
function loadLocationOptions() {
  $("#addDepartSaveBtn").removeClass("d-none");
  $("#addDepartmentModal .modal-title").text("Add department");
  $.ajax({
    url: "php/getAllLocations.php",
    type: "GET",
    dataType: "json",
    success: function (result) {
      // console.log('loadLocationOptions', result);
      if (result.status.code === '200') {
        const locationSelect = $("#addDepartmentLocation");
        locationSelect.empty(); 
        $.each(result.data, function () {
          locationSelect.append(
            $("<option>", {
              value: this.id,
              text: this.name
            })
          );
        });
      } else {
        $("#addDepartSaveBtn").addClass("d-none");
        $("#addDepartmentModal .modal-title").text("Error retrieving data ...");
      }
    },
    error: function (error) {
      $("#addDepartSaveBtn").addClass("d-none");
      $("#addDepartmentModal .modal-title").text("Error retrieving data ...");
    }
  });
}

// Function to download all Personnel records
function loadPersonnel() {
  if (selectedDepartment > 0 || selectedLocation > 0) {
    applyFilter(); // Loading filtered data
  } else {
    $.ajax({
      url: "php/getAll.php",
      type: "GET",
      dataType: "json",
      success: function (result) {
        const resultCode = result.status.code;
        if (resultCode == 200) {
            updatePersonnelTable(result.data);
        } else {
          // console.error("Error loading personnel data:", result.status.message);
          const personnelTableBody = $("#personnelTableBody");
          personnelTableBody.empty();  // clear the table before adding new records
          personnelTableBody.append(`
            <tr>
              <td colspan="5" class="text-center text-muted">Oops, something went wrong! Error loading personnel data.</td>
            </tr>
          `);
        }
      },
      error: function (error) {
        // console.error("AJAX error:", error);
        const personnelTableBody = $("#personnelTableBody");
        personnelTableBody.empty();  // clear the table before adding new records
        personnelTableBody.append(`
          <tr>
            <td colspan="5" class="text-center text-muted">Oops, something went wrong with the server! Unable to load personnel data.</td>
          </tr>
        `);
      }
    });
  }  
}

// Loading data for the departments table
function loadDepartments() {
  $.ajax({
    url: "php/getAllDepartments.php",
    type: "GET",
    dataType: "json",
    success: function (result) {
      // console.log("departments", result);
      const resultCode = result.status.code;
      if (resultCode == 200) {
        updateDepartmentTable(result.data);
      } else {
        // console.error("Error loading departments data:", result.status.message);
        const departmentTableBody = $("#departmentTableBody");
        departmentTableBody.empty(); // Clearing the table before updating
        departmentTableBody.append(`
          <tr>
            <td colspan="5" class="text-center text-muted">Oops, something went wrong! Error loading department data.</td>
          </tr>
        `);
      }
    },
    error: function (error) {
      // console.error("AJAX error:", error);
      const departmentTableBody = $("#departmentTableBody");
      departmentTableBody.empty(); // Clearing the table before updating
      departmentTableBody.append(`
        <tr>
          <td colspan="5" class="text-center text-muted">Oops, something went wrong with the server! Unable to load department data.</td>
        </tr>
      `);
    }
  });
}

// Loading data for the location table
function loadLocations() {
  $.ajax({
    url: "php/getAllLocations.php",
    type: "GET",
    dataType: "json",
    success: function (result) {
      // console.log("locations", result);
      const resultCode = result.status.code;
      if (resultCode == 200) {
        updateLocationTable(result.data);
      } else {
        // console.error("Error loading location data:", result.status.message);
        const locationTableBody = $("#locationTableBody");
        locationTableBody.empty(); // Clearing the table before updating
        locationTableBody.append(`
          <tr>
            <td colspan="5" class="text-center text-muted">Oops, something went wrong! Error loading location data.</td>
          </tr>
        `);
      }
    },
    error: function (error) {
      // console.error("AJAX error:", error);
      const locationTableBody = $("#locationTableBody");
      locationTableBody.empty(); // Clearing the table before updating
      locationTableBody.append(`
        <tr>
          <td colspan="5" class="text-center text-muted">Oops, something went wrong with the server! Unable to load location data.</td>
        </tr>
      `);
    }
  });
}

// Updating the Personnel table with the received data
function updatePersonnelTable(data) {
  const personnelTableBody = document.getElementById("personnelTableBody");
  personnelTableBody.innerHTML = ""; // Clear the table before adding new records

  if (data.length === 0) {
    // Add the "No personnel found" row directly without DocumentFragment
    personnelTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted">No personnel found.</td>
      </tr>
    `;
    return; // Exit the function early if no data
  }

  // Creating DocumentFragment for efficient DOM insertion
  const fragment = document.createDocumentFragment();

  data.forEach(person => {
    const row = document.createElement("tr");

    // Name cell
    const nameCell = document.createElement("td");
    nameCell.className = "align-middle text-nowrap";
    nameCell.textContent = `${person.lastName}, ${person.firstName}`;
    row.appendChild(nameCell);

    // Department cell
    const departmentCell = document.createElement("td");
    departmentCell.className = "align-middle text-nowrap d-none d-md-table-cell";
    departmentCell.textContent = person.departmentName;
    row.appendChild(departmentCell);

    // Location cell
    const locationCell = document.createElement("td");
    locationCell.className = "align-middle text-nowrap d-none d-md-table-cell";
    locationCell.textContent = person.locationName;
    row.appendChild(locationCell);

    // Email cell
    const emailCell = document.createElement("td");
    emailCell.className = "align-middle text-nowrap d-none d-md-table-cell";
    emailCell.textContent = person.email;
    row.appendChild(emailCell);

    // Action buttons cell
    const actionCell = document.createElement("td");
    actionCell.className = "text-end text-nowrap";

    // Create Edit button for personnel
    const editButton = createButton(
      "btn btn-primary btn-sm me-1", // Button classes
      { 
        "data-bs-toggle": "modal", 
        "data-bs-target": "#editPersonnelModal", 
        "data-id": person.id 
      }, // Button attributes
      "fa-solid fa-pencil fa-fw" // Icon classes
    );
    actionCell.appendChild(editButton);

    // Create Delete button for personnel
    const deleteButton = createButton(
      "btn btn-primary btn-sm deletePersonnelBtn", // Button classes
      { 
        "data-bs-toggle": "modal", 
        "data-bs-target": "#areYouSurePersonnelModal", 
        "data-id": person.id 
      }, // Button attributes
      "fa-solid fa-trash fa-fw" // Icon classes
    );
    actionCell.appendChild(deleteButton);


    // Append action cell to row
    row.appendChild(actionCell);
    fragment.appendChild(row); // Add row to fragment
  });

  // Append all rows at once to the table body
  personnelTableBody.appendChild(fragment);
}



// Updating the table of departments with the received data
function updateDepartmentTable(data) {
  const departmentTableBody = document.getElementById("departmentTableBody");
  departmentTableBody.innerHTML = ""; // Clearing the table before updating

  if (data.length === 0) {
    departmentTableBody.innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-muted">No departments found.</td>
      </tr>
    `;
    return;
  }

  // Creating DocumentFragment for efficient DOM insertion
  const fragment = document.createDocumentFragment();

  data.forEach(department => {
    const row = document.createElement("tr");

    // Department name cell
    const departmentCell = document.createElement("td");
    departmentCell.className = "align-middle text-nowrap";
    departmentCell.textContent = department.departmentName;
    row.appendChild(departmentCell);

    // Location name cell
    const locationCell = document.createElement("td");
    locationCell.className = "align-middle text-nowrap d-none d-md-table-cell";
    locationCell.textContent = department.locationName;
    row.appendChild(locationCell);

    // Action buttons cell
    const actionCell = document.createElement("td");
    actionCell.className = "align-middle text-end text-nowrap";

    // Create Edit button for the department
    const editButton = createButton(
      "btn btn-primary btn-sm me-1", // Button classes
      { 
        "data-bs-toggle": "modal", 
        "data-bs-target": "#editDepartmentModal", 
        "data-id": department.id 
      }, // Button attributes
      "fa-solid fa-pencil fa-fw" // Icon classes
    );
    actionCell.appendChild(editButton);

    // Create Delete button for the department
    const deleteButton = createButton(
      "btn btn-primary btn-sm deleteDepartmentBtn", // Button classes
      { "data-id": department.id }, // Button attributes
      "fa-solid fa-trash fa-fw" // Icon classes
    );
    actionCell.appendChild(deleteButton);

    // Append action cell to row
    row.appendChild(actionCell);
    fragment.appendChild(row); // Add row to fragment
  });

  // Append all rows at once to the table body
  departmentTableBody.appendChild(fragment);
}

// Updating the table of locations with the received data
function updateLocationTable(data) {
  const locationTableBody = document.getElementById("locationTableBody");
  locationTableBody.innerHTML = ""; // Clearing the table before updating

  if (data.length === 0) {
    // Adding the "No locations found" row directly without DocumentFragment
    locationTableBody.innerHTML = `
      <tr>
        <td colspan="2" class="text-center text-muted">No locations found.</td>
      </tr>
    `;
    return;
  }
  // Creating DocumentFragment for efficient DOM insertion
  const fragment = document.createDocumentFragment();

  data.forEach(location => {
    const row = document.createElement("tr");

    // Location name cell
    const nameCell = document.createElement("td");
    nameCell.className = "align-middle text-nowrap";
    nameCell.textContent = location.name;
    row.appendChild(nameCell);

    // Action buttons cell
    const actionCell = document.createElement("td");
    actionCell.className = "align-middle text-end text-nowrap";

    // Edit button
    const editButton = createButton(
      "btn btn-primary btn-sm me-1", // button class
      { 
        "data-bs-toggle": "modal", 
        "data-bs-target": "#editLocationModal", 
        "data-id": location.id 
      }, // button attributes
      "fa-solid fa-pencil fa-fw" // class icons
    );
    actionCell.appendChild(editButton);

    // Delete button
    const deleteButton = createButton(
      "btn btn-primary btn-sm deleteLocationBtn", // button class
      { "data-id": location.id }, // button attributes
      "fa-solid fa-trash fa-fw" // class icons
    );
    actionCell.appendChild(deleteButton);

    row.appendChild(actionCell);
    fragment.appendChild(row); // Add row to fragment
  });

  locationTableBody.appendChild(fragment); // Append all rows at once
}

// Function to show notification
function showNotification(message, title = "Notification") {
  $("#notificationModalLabel").text(title);
  $("#notificationMessage").text(message);
  $("#notificationModal").modal("show");
}

// Button creation function
function createButton(className, dataAttributes, iconClass) {
  const button = document.createElement("button");
  button.className = className;
  Object.keys(dataAttributes).forEach(attr => button.setAttribute(attr, dataAttributes[attr]));
  button.innerHTML = `<i class="${iconClass}"></i>`;
  return button;
}