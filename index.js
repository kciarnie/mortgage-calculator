var express = require('express');
var mortgage = require('./mortgage');
var app = express()
 
/**
 * GET /rate
 * disabled
 */
app.get('/rate', function(req, res) {
    var errorMessage = "GET has been disabled. Please use POST with the following parameters: " + 
    "asking_price, down_payment, amortization_period, payment_schedule";
    return res.send(showError(errorMessage, 500));
});

/**
 * This is the rate call.
 * Gets the monthly value allotted.
 */
app.post('/rate', function (req, res) {

    var asking_price = req.query.asking_price;
    var down_payment = req.query.down_payment;
    var amortization_period = req.query.amortization_period;
    var payment_schedule = req.query.payment_schedule;

    // If all the parameters exist
    if (asking_price && down_payment && amortization_period && payment_schedule)
    {
        // calculate the monthly payment
        var monthly_payment = mortgage.calculate(asking_price, down_payment, amortization_period, payment_schedule);

        // if the payment is not a number display the error
        if (isNaN(monthly_payment))
        {
            return res.send(showError(monthly_payment, 500));
        }
        else
        {
            // display the JSON if the monthly_payment exists
            res.json(
                {
                    monthly_payment : parseFloat(monthly_payment),
                    status: 200,
                    timestamp : parseInt(Date.now()/1000)
                });
        }
    }
    else
    {
        // Find out which variable(s) don't exist and tell the user
        var errorMessage = "";
        if (!asking_price)
        {
            errorMessage += 'Asking price does not exist. ';
        }
        if (!down_payment)
        {
            errorMessage += 'Down payment does not exist. ';
        }
        if (!amortization_period)
        {
            errorMessage += 'Amortization period does not exist. ';
        }
        if (!payment_schedule)
        {
            errorMessage += 'Payment Schedule does not exist. ';
        }
        return res.send(showError(errorMessage, 404));
    }
});

/**
 * This function is used to show the error message
 * msg, the message that you want to display
 * status, the error status number
 */
var showError = function(msg, status)
{
    var error = new Error();
    error.errorMessage = msg;
    error.status = status;
    error.timestamp = parseInt(Date.now()/1000);
    return error;
}

/**
 * Listen in on http://localhost:3000
 */
app.listen(3000)