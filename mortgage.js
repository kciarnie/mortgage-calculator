module.exports = {
    /*
Mortgage interest rate 2.5% per year

Payment formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
P = Payment
L = Loan Principal
c = Interest Rate
n = Number of payments 
*/
    /**
     * This is the calculation function. The asking price, down payment, amortization are all
     * numeric, so we have to check to see if they are sent correctly.
     * 
     * The payment schedule is only biweekly, weekly or monthly

     */
    calculate: function(asking_price, down_payment, amortization_period, payment_schedule) {
        var number_of_payments;

        if (payment_schedule == undefined || !(payment_schedule == 'biweekly'  || 
            payment_schedule != 'weekly' || payment_schedule != 'monthly'))
        {
            // Incorrect payment schedule, throw error
            return "The payment schedule is not biweekly, weekly or monthly.";
        }

        // Check if the asking price is a number
        if (isNaN(asking_price))
        {
            return "Asking price is not a valid number.";
        }

        // Check if the down payment is a number
        if (isNaN(down_payment))
        {
            return "The down payment is not a valid number.";
        }

        // Check if the amortization period is a number
        if (isNaN(amortization_period))
        {
            return "The amortization period is not a valid number.";
        }
        
        // Must be at least 5% of first $500k plus 10% of any amount above $500k (So $50k on a $750k mortgage)
        if (!mortgage.isMinimumDownPayment(asking_price, down_payment))
        {
            return "The down payment is not enough to cover the asking price.";
        }

        // Min 5 years, max 25 years
        if (amortization_period < 5 && amortization_period > 25)
        {
            return "An invalid amortization period was given."
        }

        // The principal is the asking price minus what is put down.
        var loan_principal = asking_price - down_payment;

        // if the asking price is less than 1 mil, calculate the insurance ontop
        if (asking_price <= 1000000)
        {
            var mortgage_insurance = mortgage.calculateInsuranceRate(down_payment / asking_price);
            loan_principal = parseInt(asking_price) + parseInt(mortgage_insurance * asking_price);
        }

        // calculate the number of payments
        var number_of_payments;
        if (payment_schedule == 'biweekly')
        {
            number_of_payments = 26 * amortization_period;
        }
        else if (payment_schedule == 'weekly')
        {
            number_of_payments = 52 * amortization_period;
        }
        else if (payment_schedule == 'monthly')
        {
            number_of_payments = 12 * amortization_period;
        }

        return mortgage.calculate_payment(loan_principal, 0.025 / 12, number_of_payments);
    }
}

var mortgage = 
{
    /**
     * Mortgage insurance rates are as follows:
     * Downpayment	 Insurance Cost
     * 5-9.99%		 3.15%
     * 10-14.99%	 2.4%
     * 15%-19.99%	 1.8%
     * 20%+		 N/A
     * 
     * Mortgage insurance is required on all mortgages with less than 20% down.  
     * Insurance must be calculated and added to the mortgage principal. 
     * Mortgage insurance is not available for mortgages > $1 million. 
     */
    calculateInsuranceRate: function(percentage)
    {
        if (percentage >= 0.05 && percentage < 0.1)
        {
            return 0.0315;
        }
        else if (percentage >= 0.1 && percentage < 0.15)
        {
            return 0.024;
        }
        else if (percentage >= 0.15 && percentage < 0.2)
        {
            return 0.018
        }
        else if (percentage >= 0.2)
        {
            return 0;
        }
    },

    /**
     * Checks to see if the minimum down payment is greater than the asking price
     */
    isMinimumDownPayment: function(asking_price, down_payment)
    {
        if (asking_price > 500000)
        {
            var valueOver = asking_price - 500000;
            return down_payment >= ((valueOver * 0.10) + (500000 * 0.05)) 
        }
        else
        {
            return down_payment >= (asking_price * 0.05)
        }
    },

    /**
     * Payment Formula
     * Payment formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
        P = Payment
        L = Loan Principal
        c = Interest Rate
        n = Number of payments 
     */
    calculate_payment: function(L, c, n)
    {
        var multiple = (1 + c)^n;
        var p = L * c * multiple / (multiple - 1);

        // return the float as a dollar value XXXX.XX
        return p.toFixed(2);
    }
}