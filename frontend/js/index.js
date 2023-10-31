// open the credential dialog on loading the window
let cookieName = 'callbackSolCookie';

$(document).ready(function () {
  
  let cookieValue = getCookie(cookieName);
  if(cookieValue && cookieValue.length>0){
    loadPageInfo();
  }
  else{
    openLogin();
  }  

  
  var span = document.getElementsByClassName("close")[0];
  span.onclick = function() {
    closeLogin();
  }
  var modal = document.getElementById("loginModal");
  window.onclick = function(event) {
    if (event.target == modal) {
      closeLogin();
    }
  }

  // Listen for click on toggle checkbox
  $('#select-all').click(function (event) {
    if (this.checked) {
      // Iterate each checkbox
      $(':checkbox').each(function () {
        this.checked = true;
      });
    } else {
      $(':checkbox').each(function () {
        this.checked = false;
      });
    }
  });

})

function stopMultipleContact() {

  var selected = new Array();

  $("input:checkbox[name=selectContact]:checked").each(function () {
    selected.push($(this).val());
  });
  // PHASE 2 
  var stopMessage = '';//document.getElementById("stopMessage").value;

  if (selected && selected.length > 0) {

    for (let index = 0; index < selected.length; index++) {

      const element = selected[index];
      stopContact(element, stopMessage);
    }

  } else {
    alert('No Stop Select Checkbox selected');
  }

  console.log(selected);
}

function download() {
  var queue = document.getElementById("queue").value;
  var status = document.getElementById("status").value;

  var host = window.location.protocol + '//' + window.location.hostname + '/secure/';

  var url = host + 'ctrList?operation=DOWNLOAD';
  url = url + '&queue=' + queue;
  url = url + '&status=' + status;

  let cookieValue = getCookie(cookieName);
  $.ajax({
    type: 'GET',
    url: url,
    headers: {
      Authorization: cookieValue,
    },
    xhrFields: {
      responseType: 'blob'
    },
    success: function (data) {
      var a = document.createElement('a');
      var url = window.URL.createObjectURL(data);
      a.href = url;
      a.download = 'download.csv';
      document.body.append(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },
    error: function (xhr, ajaxOptions, throwError) {
    },
  });
};

function stopContact(contactId, stopMessage) {
  var host = window.location.protocol + '//' + window.location.hostname + '/secure/';
  var url = host + 'ctrList?operation=STOP&contactId=' + contactId + '&stopMessage=' + stopMessage;

  let cookieValue = getCookie(cookieName);
  $.ajax({
    type: 'GET',
    url: url,
    headers: {
      Authorization: cookieValue,
    },
    success: function (data) {
      console.log(data);
      getCallbackInfo();
    },
    error: function (xhr, ajaxOptions, throwError) {
      console.log('service call failed');
    },
  });

}
function loadQueueDropdown() {
  var host = window.location.protocol + '//' + window.location.hostname + '/secure/';
  var url = host + 'ctrList?operation=LIST';
  let cookieValue = getCookie(cookieName);

  $.ajax({
    type: 'GET',
    url: url,
    headers: {
      Authorization: cookieValue,
    },
    success: function (data) {
      data.forEach(option => {

        const queueDropdown = document.getElementById("queue");
        const newOption = document.createElement("option");
        console.log(option);
        newOption.value = option;
        newOption.text = option;
        queueDropdown.appendChild(newOption);
      });
    },
    error: function (xhr, ajaxOptions, throwError) {
      console.log('service call failed');
    },
  });

}
function getCallbackInfo() {
  var queue = document.getElementById("queue").value;
  var status = document.getElementById("status").value;

  $("#contactIdDetailTable tbody tr").remove();

  var host = window.location.protocol + '//' + window.location.hostname + '/secure/';

  var url = host + 'ctrList?operation=SEARCH';
  url = url + '&queue=' + queue;
  url = url + '&status=' + status;

  let cookieValue = getCookie(cookieName);

  $.ajax({
    type: 'GET',
    url: url,
    headers: {
      Authorization: cookieValue,
    },
    success: function (data) {
      if (data && data.Items) {
        var tableBody = $('#contactIdDetailTable tbody');
  
        for (const [key, value] of Object.entries(data.Items)) {
  
          var row = $('<tr>');
          if (value.callbacknumber && value.callbacknumber.S) {
            row.append($('<td>').text(value.callbacknumber.S));
          }
          else {
            row.append($('<td>').text('NA'));
          }
          row.append($('<td>').html('&nbsp;&nbsp;&nbsp;&nbsp;'));
  
          row.append($('<td>').text(value.contactId.S));
  
          row.append($('<td>').html('&nbsp;&nbsp;&nbsp;&nbsp;'));
          if (value.queueName && value.queueName.S) {
            row.append($('<td>').text(value.queueName.S));
          }
          else {
            row.append($('<td>').text('NA'));
          }
  
          row.append($('<td>').html('&nbsp;&nbsp;&nbsp;&nbsp;'));
          if (value.queueId && value.queueId.S) {
            row.append($('<td>').text(value.queueId.S));
          }
          else {
            row.append($('<td>').text('NA'));
          }
  
          row.append($('<td>').html('&nbsp;&nbsp;&nbsp;&nbsp;'));
          row.append($('<td>').text(value.callbackStatus.S));
  
          row.append($('<td>').html('&nbsp;&nbsp;&nbsp;&nbsp;'));
          row.append($('<td>').text(value.eventTime.S));
  
          row.append($('<td>').html('&nbsp;&nbsp;&nbsp;&nbsp;'));
          if (value.duplicateStatus && value.duplicateStatus.S) {
            row.append($('<td>').text(value.duplicateStatus.S));
          }
          else {
            row.append($('<td>').text('NA'));
          }
  
          row.append($('<td>').html('&nbsp;&nbsp;&nbsp;&nbsp;'));
  
          if (value.callbackStatus.S === 'INITIATED' && value.contactId && value.contactId.S) {
            row.append($('<td>').html('<input type="checkbox" name="selectContact" id="selectContact" value="' + value.contactId.S + '"> <br>'));
          }
          else if (value.callbackStatus.S === 'QUEUED' && value.contactId && value.contactId.S) {
            row.append($('<td>').html('<input type="checkbox" name="selectContact" id="selectContact" value="' + value.contactId.S + '"> <br>'));
          }
          else {
            //row.append($('<td>').html('NA'));
          }
          tableBody.append(row);
        }
      }
  
    },
    error: function (xhr, ajaxOptions, throwError) {
      console.log('not able to load data');
    },
  });
};
function loginAfterConfig(data) {

  let aws_project_region = data.aws_project_region;
  let aws_cognito_identity_pool_id = data.aws_cognito_identity_pool_id;

  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  if (username && username.length > 0 && password && password.length > 0) {
    var url = 'https://cognito-idp.'+aws_project_region+'.amazonaws.com/';

    let authBody ={
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
          PASSWORD: password,
          USERNAME: username,
      },
      ClientId: aws_cognito_identity_pool_id,
    };

    $.ajax({
      type: 'POST',
      url: url,
      headers: {
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
        'Content-Type': 'application/x-amz-json-1.1',
      },
      data: JSON.stringify(authBody),      
      success: function (data) {
        if(data && data.AuthenticationResult && data.AuthenticationResult.IdToken){
          setCookie( cookieName, data.AuthenticationResult.IdToken , 1);
          closeLogin();
          loadPageInfo();
        }
        else{
          $('#errorLogin').html('Invalid Credentials');
        }
      },
      error: function (xhr, ajaxOptions, throwError) {
        $('#errorLogin').html('Invalid Credentials');
        console.log('service call failed');
      },
    });

  } else {
    alert('Please enter valid username/password');
  }
}
function setCookie(cname, cvalue, hours) {
  const d = new Date();
  d.setTime(d.getTime() + (hours*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
function openLogin(){
  var modal = document.getElementById("loginModal");
  modal.style.display = "block";
}
function closeLogin(){
  var modal = document.getElementById("loginModal");
  modal.style.display = "none";
}

function loadPageInfo(){
  loadQueueDropdown();
  getCallbackInfo();
}
function login() {
  var host = window.location.protocol + '//' + window.location.hostname + '/public/';
  var url = host + 'config';

  $.ajax({
    type: 'GET',
    url: url,
    success: function (data) {
      console.log(data);
      if(data){
        loginAfterConfig(data);
      }
    },
    error: function (xhr, ajaxOptions, throwError) {
      console.log('service call failed');
    },
  });

}

