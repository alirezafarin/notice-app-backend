const sendError = (res={}, error={}, status=400) => {
  let errorMessage = '';
  if(typeof error === 'object') {
    let errorsObj = error.errors; 
    if(errorsObj) {
      let errorKeys = Object.keys(errorsObj);
      errorKeys.forEach((errorKey) => {
        errorMessage += `${errorsObj[errorKey].message},`;
      });
    }
    else if(error.message) {
      errorMessage = error.message;
      // status = 409;
    }
  }
  // errorMessage = error;
  // console.log(error.message);
  res.status(status).send({
    error: errorMessage
  });
}

const sendResponse = (res={}, message='', data={}, status=200) => {
  res.status(status).send({
    message,
    data,
  });
}

module.exports = {
  sendError,
  sendResponse
}