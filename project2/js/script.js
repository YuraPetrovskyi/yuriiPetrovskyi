$("#searchInp").on("keyup", function () {
  const query = $(this).val();
  $.ajax({
    url: "php/SearchAll.php",
    type: "POST",
    dataType: "json",
    data: { txt: query },
    success: function (result) {
      console.log("search", result);
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
  if ($("#personnelBtn").hasClass("active")) {
    loadPersonnel(); // Refresh personnel table 
  } else {
    if ($("#departmentsBtn").hasClass("active")) {
      loadDepartments(); // Refresh department table
    } else {
      // Refresh location table
    }
  }
});

$("#filterBtn").click(function () {
  
  // Open a modal of your own design that allows the user to apply a filter to the personnel table on either department or location
  
});

$("#addBtn").click(function () {
  
  // Replicate the logic of the refresh button click to open the add modal for the table that is currently on display
  
});

$("#personnelBtn").click(function () {
  loadPersonnel(); // Call function to refresh personnel table
});

$("#departmentsBtn").click(function () {
  loadDepartments(); // Call function to refresh department table
});

$("#locationsBtn").click(function () {
  
  // Call function to refresh location table
  
});

$("#editPersonnelModal").on("show.bs.modal", function (e) {
  
  $.ajax({
    url:
      "https://coding.itcareerswitch.co.uk/companydirectory/libs/php/getPersonnelByID.php",
    type: "POST",
    dataType: "json",
    data: {
      // Retrieve the data-id attribute from the calling button
      // see https://getbootstrap.com/docs/5.0/components/modal/#varying-modal-content
      // for the non-jQuery JavaScript alternative
      id: $(e.relatedTarget).attr("data-id") 
    },
    success: function (result) {
      var resultCode = result.status.code;

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
  
  // Executes when the form button with type="submit" is clicked
  // stop the default browser behviour

  e.preventDefault();

  // AJAX call to save form data
  
});

// ******************************************************************************************* //
// Loading data when the page is first loaded
document.addEventListener("DOMContentLoaded", function () {
  loadPersonnel();
});

// Function to download all Personnel records
function loadPersonnel() {
  $.ajax({
    url: "php/getAll.php",
    type: "GET",
    dataType: "json",
    success: function (result) {
      console.log('result', result)
      if (result.status.code === '200') {
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

// Updating the Personnel table with the received data
function updatePersonnelTable(data) {
  console.log('updated data', data)
  const personnelTableBody = $("#personnelTableBody");
  personnelTableBody.empty();  // clear the table before adding new records
  data.forEach(person => {
    personnelTableBody.append(`
      <tr>
        <td>${person.firstName} ${person.lastName}</td>
        <td class="align-middle text-nowrap d-none d-md-table-cell">${person.jobTitle}</td>
        <td class="align-middle text-nowrap d-none d-md-table-cell">${person.locationName}</td>
        <td class="align-middle text-nowrap d-none d-md-table-cell">${person.email}</td>
        <td class="text-end text-nowrap">
          <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="${person.id}">
            <i class="fa-solid fa-pencil fa-fw"></i>
          </button> 
          <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deletePersonnelModal" data-id="${person.id}">
            <i class="fa-solid fa-trash fa-fw"></i>
          </button>
        </td>
      </tr>
    `);
  });
}

// Loading data for the departments table
function loadDepartments() {
  $.ajax({
    url: "php/getAllDepartments.php",
    type: "GET",
    dataType: "json",
    success: function (result) {
      console.log("departments", result);
      if (result.status.code === '200') {
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

// Updating the table of departments with the received data
function updateDepartmentTable(data) {
  const departmentTableBody = $("#departmentTableBody");
  departmentTableBody.empty(); // Clearing the table before updating

  data.forEach(department => {
    departmentTableBody.append(`
      <tr>
        <td class="align-middle text-nowrap">${department.departmentName}</td>
        <td class="align-middle text-nowrap d-none d-md-table-cell">${department.locationName}</td>
        <td class="align-middle text-end text-nowrap">
          <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${department.id}">
            <i class="fa-solid fa-pencil fa-fw"></i>
          </button>
          <button type="button" class="btn btn-primary btn-sm deleteDepartmentBtn" data-id="${department.id}">
            <i class="fa-solid fa-trash fa-fw"></i>
          </button>
        </td>
      </tr>
    `);
  });
}