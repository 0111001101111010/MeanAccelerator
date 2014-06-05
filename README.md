#MEAN Accelerator#

This is a MEAN (Mongo, Express, Angular, Node) web starter kit. It includes common features needed by almost all web applications include Sign Up, Sign In, Sign Out, Forgot Password, Update Profile, Update Password, and several stubbed out pages such as a home page, blog, etc.

Forked from [Kevin Griffin's](https://github.com/1kevgriff) starter web application project.

##Technologies/Frameworks/Services Used##

* NodeJS
* AngularJS
* ExpressJS
* MongoDB
* Bootstrap 3
* Mandrill (for sending emails)

##Configurations Required##

###Email###

  * Update `/server/config/environment`
    * Replace email@yourcompany.com with your appropriate email address(es)
  * Create a [Mandrill](http://mandrill.com) user account
  * Update `/server/config/mandrill`; enter your API key

###MongoDB###

  * In development environment, will run off of your local Mongo installation.
  * When ready to Production, update the connection string to MongoDB in `/server/config/environment
