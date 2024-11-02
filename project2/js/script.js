// Loading data when the page is first loaded
$(document).ready(function () {
  loadPersonnel();
  toggleSearchField();

  // Add an event to the tabs to activate/deactivate the search field
  $("#personnelBtn, #departmentsBtn, #locationsBtn").on("click", toggleSearchField);

  // Search event
  $("#searchInp").on("keyup", function () {
    const query = $(this).val();
    $.ajax({
      url: "php/SearchAll.php",
      type: "POST",
      dataType: "json",
      data: { txt: query },
      success: function (result) {
        // console.log("search", result);
        if (result.status.code === '200') {
          updatePersonnelTable(result.data.found);
        } else {
          console.error("Error loading personnel data:", result.status.message);
        }
      },
      error: function (error) {
        console.error("AJAX error:", error);
      }
    });
  });

  $("#refreshBtn").click(function () {
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
    // First, we hide all the filter options
    $(".filter-options").addClass("d-none");

    // Select the active tab
    if ($("#personnelBtn").hasClass("active")) {
      $("#locationFilterOptions").removeClass("d-none");
      $("#departmentFilterOptions").removeClass("d-none");
      $("#sortFilterOptions").removeClass("d-none");
      loadFilterOptions("personnel");
    } else if ($("#departmentsBtn").hasClass("active")) {
      $("#locationFilterOptions").removeClass("d-none");
      $("#departmentFilterOptions").addClass("d-none");
      $("#sortFilterOptions").addClass("d-none");
      loadFilterOptions("department");
    } else if ($("#locationsBtn").hasClass("active")) {
      $("#locationFilterOptions").addClass("d-none");
      $("#departmentFilterOptions").addClass("d-none");
      $("#sortFilterOptions").removeClass("d-none");
      loadFilterOptions("location");
    }

    $("#filterModal").modal("show");
  });

  // Filter application
  $("#applyFilterBtn").click(function () {
    $("#searchInp").val(""); // Clear search input
    // Collect the selected values ​​for the filter
    const selectedLocations = $("#locationCheckboxGroup input:checked")
      .map(function() { return this.value; })
      .get();
    const selectedDepartments = $("#departmentCheckboxGroup input:checked")
      .map(function() { return this.value; })
      .get();
    const sortOrder = $("#sortOrder").val();

    const activeTab = $(".nav-link.active").attr("id");

    // Preparing the filter data for sending to the server
    const filterData = {
      locations: selectedLocations,
      departments: selectedDepartments,
      order: sortOrder
    };
    // console.log('filterData', filterData);
    let serverUrl;
    if (activeTab === "personnelBtn") serverUrl = "php/filterPersonnel.php";
    if (activeTab === "departmentsBtn") serverUrl = "php/filterDepartments.php";
    if (activeTab === "locationsBtn") serverUrl = "php/filterLocations.php";

    // Execute an AJAX request to apply the filter
    $.ajax({
      url: serverUrl,
      type: "POST",
      dataType: "json",
      data: filterData,
      success: function (result) {
        $("#filterModal").modal("hide");
        // console.log(filter result);
        if (activeTab === "personnelBtn") updatePersonnelTable(result.data);
        if (activeTab === "departmentsBtn") updateDepartmentTable(result.data);
        if (activeTab === "locationsBtn") updateLocationTable(result.data);
      },
      error: function (error) {
        console.error("Error applying filter:", error);
      }
    });
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
          $("#searchInp").val(""); // Clear search input
          $("#addPersonnelModal").modal("hide"); // close the modal window after successful addition
          loadPersonnel(); // update the table of employees
        } else {
          $("#addPersonnelModal .modal-title").replaceWith(
            "<span class='text-danger'>Error adding personnel</span>"
          );
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#addPersonnelModal .modal-title").replaceWith(
          "<span class='text-danger'>Error retrieving data</span>"
        );
      }
    });
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
                $("#addDepartmentError").addClass("d-none").text(""); // Reset errors
                loadDepartments();
            } else {
                $("#addDepartmentError").removeClass("d-none").text("Error adding department: " + result.status.message);
            }
        },
        error: function (error) {
            $("#addDepartmentError").removeClass("d-none").text("AJAX error: Unable to add department.");
            console.error("AJAX error:", error);
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
          $("#addLocationError").addClass("d-none").text("");
          loadLocations();
        } else {
          $("#addLocationError").removeClass("d-none").text("Error adding location: " + result.status.message);
        }
      },
      error: function (error) {
        $("#addLocationError").removeClass("d-none").text("AJAX error: Unable to add location.");
        console.error("AJAX error:", error);
      }
    });
  });


  $("#personnelBtn").click(function () {
    loadPersonnel(); // Call function to refresh personnel table
  });

  $("#departmentsBtn").click(function () {
    loadDepartments(); // Call function to refresh department table
  });

  $("#locationsBtn").click(function () {
    loadLocations(); // Call function to refresh location table
  });

  $("#editPersonnelModal").on("show.bs.modal", function (e) {
    
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
          $("#editPersonnelModal .modal-title").replaceWith(
            "Error retrieving data"
          );
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#editPersonnelModal .modal-title").replaceWith(
          "Error retrieving data"
        );
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
          $("#searchInp").val(""); // Clear search input
          // Close the modal window after a successful update
          $("#editPersonnelModal").modal("hide");

          // Update the employee table after making changes
          loadPersonnel();
        } else {
          console.error("Error updating personnel data:", result.status.message);
        }
      },
      error: function (error) {
        console.error("AJAX error:", error);
      }
    });  
  });

  // Event to open a modal edit department window
  $("#editDepartmentModal").on("show.bs.modal", function (e) {
    const departmentId = $(e.relatedTarget).data("id");
    // console.log('departmentId', departmentId);

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
          console.error("Error loading department data:", result.status.message);
        }
      },
      error: function (error) {
        console.error("AJAX error:", error);
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
          console.error("Error updating department data:", result.status.message);
        }
      },
      error: function (error) {
        console.error("AJAX error:", error);
      }
    });
  });

  // Modal window for editing the location
  $("#editLocationModal").on("show.bs.modal", function (e) {
    const locationID = $(e.relatedTarget).data("id");
    const locationName = $(e.relatedTarget).data("name");

    // Fill in the fields of the modal window
    $("#editLocationID").val(locationID);
    $("#editLocationName").val(locationName);
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
          console.error("Error updating location:", result.status.message);
        }
      },
      error: function (error) {
        console.error("AJAX error:", error);
      }
    });
  });

  // Show a modal window to confirm the deletion
  $(document).on("click", ".deleteBtn", function () {
    const idToDelete = $(this).data("id");
    const nameToDelete = $(this).data("name");

    const activeTab = $(".nav-link.active").attr("id");

    $("#deleteError").addClass("d-none").text("");
    $("#confirmDeleteBtn").removeClass('d-none');
    $("#deleteName").text(nameToDelete);

    let tableType;
    if (activeTab === "personnelBtn") {
      tableType = "personnel";
    } else if (activeTab === "departmentsBtn") {
      tableType = "department";
    } else if (activeTab === "locationsBtn") {
      tableType = "location";
    }

    // console.log('idToDelete', idToDelete)
    // console.log('nameToDelete', nameToDelete)

    // Check dependencies
    $.ajax({
      url: "php/checkDependencies.php",
      type: "POST",
      dataType: "json",
      data: { id: idToDelete, tableType: tableType },
      success: function (result) {
        if (result.data.hasDependencies) {
          $("#confirmDeleteBtn").addClass('d-none');
          $("#deleteError").removeClass("d-none").text("Deletion is not allowed as this item is referenced by other records.");
        } else {
          // Show a modal window to confirm the deletion
          $("#confirmDeleteBtn").data("id", idToDelete);
          // Hide the previous error message, if there is one
          $("#deleteError").addClass("d-none").text("");
          $("#deleteModal").modal("show");
        }
      },
      error: function (error) {
        console.error("Error checking dependencies:", error);
        $("#confirmDeleteBtn").addClass('d-none');
        $("#deleteError").removeClass("d-none").text("AJAX error: Unable to delete the item.");
      }
    });
  });

  // Handling the "Delete" button click in a modal window
  $("#confirmDeleteBtn").click(function () {
    const idToDelete = $(this).data("id");
    // console.log('id to delete: ', idToDelete);
    
    let server;
    if ($("#personnelBtn").hasClass("active")) {
      server = "php/deletePersonnelByID.php";
    } else if ($("#departmentsBtn").hasClass("active")) {
      server = "php/deleteDepartmentByID.php";
    } else if ($("#locationsBtn").hasClass("active")) {
      server = "php/deleteLocationByID.php";
    }

    if (idToDelete && server) {
      $.ajax({
        url: server,
        type: "POST",
        dataType: "json",
        data: { id: idToDelete },
        success: function (result) {
          if (result.status.code === "200") {
            $("#searchInp").val(""); // Clear search input
            $("#deleteModal").modal("hide"); // Close the modal window after successful removal
            $("#deleteError").addClass("d-none").text(""); // Reset the error
            if ($("#personnelBtn").hasClass("active")) {
                loadPersonnel();
            } else if ($("#departmentsBtn").hasClass("active")) {
                loadDepartments();
            } else if ($("#locationsBtn").hasClass("active")) {
                loadLocations();
            }
          } else {
            console.error("Error deleting personnel:", result.status.message);
            $("#deleteError").removeClass("d-none").text("Error deleting item: " + result.status.message);
          }
        },
        error: function (error) {
          $("#deleteError").removeClass("d-none").text("AJAX error: Unable to delete the item.");
          console.error("AJAX error:", error);
        }
      });
    }
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

// Loading checkboxes for locations and departments
function loadFilterOptions(tab) {
  $.ajax({
    url: "php/getFilterOptions.php",
    type: "GET",
    dataType: "json",
    success: function (result) {
      if (result.status.code === "200") {
        // Clear and fill in the checkboxes for locations
        const locationCheckboxGroup = $("#locationCheckboxGroup");
        locationCheckboxGroup.empty();
        result.data.locations.forEach(location => {
          locationCheckboxGroup.append(`
            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="${location.id}" id="location${location.id}">
              <label class="form-check-label" for="location${location.id}">${location.name}</label>
            </div>
          `);
        });

        // If the personnel tab is selected, we add departments
        if (tab === "personnel") {
          const departmentCheckboxGroup = $("#departmentCheckboxGroup");
          departmentCheckboxGroup.empty();
          result.data.departments.forEach(department => {
            departmentCheckboxGroup.append(`
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${department.id}" id="department${department.id}">
                <label class="form-check-label" for="department${department.id}">${department.name}</label>
              </div>
            `);
          });
        }
      }
    },
    error: function (error) {
      console.error("Error loading filter options:", error);
    }
  });
}

// downloading the list of departments
function loadDepartmentOptions() {
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
        console.error("Error retrieving department data:", result.status.message);
      }
    },
    error: function (error) {
      console.error("AJAX error:", error);
    }
  });
}

// Loading the list of locations
function loadLocationOptions() {
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
        console.error("Error retrieving location data:", result.status.message);
      }
    },
    error: function (error) {
      console.error("AJAX error:", error);
    }
  });
}

// Function to download all Personnel records
function loadPersonnel() {
  $.ajax({
    url: "php/getAll.php",
    type: "GET",
    dataType: "json",
    success: function (result) {
      // console.log('result', result)
      const resultCode = result.status.code;
      if (resultCode == 200) {
          updatePersonnelTable(result.data);
      } else {
          console.error("Error loading personnel data:", result.status.message);
      }
    },
    error: function (error) {
      console.error("AJAX error:", error);
    }
  });
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
        console.error("Error loading departments data:", result.status.message);
      }
    },
    error: function (error) {
      console.error("AJAX error:", error);
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
        console.error("Error loading location data:", result.status.message);
      }
    },
    error: function (error) {
      console.error("AJAX error:", error);
    }
  });
}

// Updating the Personnel table with the received data
function updatePersonnelTable(data) {
  // console.log('updated data', data)
  const personnelTableBody = $("#personnelTableBody");
  personnelTableBody.empty();  // clear the table before adding new records
  
  if (data.length === 0) { // If the filtered data is empty, show a message
    personnelTableBody.append(`
      <tr>
        <td colspan="5" class="text-center text-muted">No personnel found.</td>
      </tr>
    `);
    return; // Exit the function early if no data
  }
  data.forEach(person => {
    personnelTableBody.append(`
      <tr>
        <td>${person.lastName}, ${person.firstName}</td>
        <td class="align-middle text-nowrap d-none d-md-table-cell">${person.departmentName}</td>
        <td class="align-middle text-nowrap d-none d-md-table-cell">${person.locationName}</td>
        <td class="align-middle text-nowrap d-none d-md-table-cell">${person.email}</td>
        <td class="text-end text-nowrap">
          <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="${person.id}">
            <i class="fa-solid fa-pencil fa-fw"></i>
          </button> 
          <button type="button" class="btn btn-primary btn-sm deleteBtn" data-bs-toggle="modal" data-bs-target="#deleteModal" data-id="${person.id}" data-name="${person.firstName} ${person.lastName}">
            <i class="fa-solid fa-trash fa-fw"></i>
          </button>
        </td>
      </tr>
    `);
  });
}

// Updating the table of departments with the received data
function updateDepartmentTable(data) {
  const departmentTableBody = $("#departmentTableBody");
  departmentTableBody.empty(); // Clearing the table before updating

  if (data.length === 0) {
    departmentTableBody.append(`
      <tr>
        <td colspan="3" class="text-center text-muted">No departments found.</td>
      </tr>
    `);
    return;
  }

  data.forEach(department => {
    departmentTableBody.append(`
      <tr>
        <td class="align-middle text-nowrap">${department.departmentName}</td>
        <td class="align-middle text-nowrap d-none d-md-table-cell">${department.locationName}</td>
        <td class="align-middle text-end text-nowrap">
          <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${department.id}">
            <i class="fa-solid fa-pencil fa-fw"></i>
          </button>
          <button type="button" class="btn btn-primary btn-sm deleteBtn" data-bs-toggle="modal" data-bs-target="#deleteModal" data-id="${department.id}" data-name="${department.departmentName}">
            <i class="fa-solid fa-trash fa-fw"></i>
          </button>
        </td>
      </tr>
    `);
  });
}

// Updating the table of locations with the received data
function updateLocationTable(data) {
  const locationTableBody = $("#locationTableBody");
  locationTableBody.empty(); // Clearing the table before updating

  if (data.length === 0) {
    locationTableBody.append(`
      <tr>
        <td colspan="2" class="text-center text-muted">No locations found.</td>
      </tr>
    `);
    return;
  }

  data.forEach(location => {
    locationTableBody.append(`
      <tr>
        <td class="align-middle text-nowrap">${location.name}</td>
        <td class="align-middle text-end text-nowrap">
          <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-id="${location.id}" data-name="${location.name}">
            <i class="fa-solid fa-pencil fa-fw"></i>
          </button>
          <button type="button" class="btn btn-primary btn-sm deleteBtn" data-bs-toggle="modal" data-bs-target="#deleteModal" data-id="${location.id}" data-name="${location.name}">
            <i class="fa-solid fa-trash fa-fw"></i>
          </button>
        </td>
      </tr>
    `);
  });
}