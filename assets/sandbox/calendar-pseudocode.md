# calendar functionality

on page load:
    create a variable of the current month
    create a variable of the current year
    call from firebase 
        directory events / year / month
        create an array of each object within the directory
        (possibly include objects from next month)
        initialize calendar with this array