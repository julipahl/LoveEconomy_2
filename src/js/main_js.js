
/////////////////
// QR code js //
///////////////


// function to avoid having to type querySelector each time

function select(el) {
    return document.querySelector(el);
  }
  
  let qrcode = select("img");
  let qrtext = select("textarea");
  
 // qrbutton.addEventListener("click", generateQR);
  
 function generateQR() {
    let size = "1000x1000";
    let data = qrtext.value; // whatever we enter into the text box will generate a qr code with that information
    let baseURL = "http://api.qrserver.com/v1/create-qr-code/"; // what generates the qr code
  
    let url = `${baseURL}?data=${data}&size=${size}`;
    
  
    qrcode.src = url; // this means that everytime the function is run, it will update the image with the new qr code
  
  };

  
