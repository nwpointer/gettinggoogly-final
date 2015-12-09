##Architecture:
the architecture consists of three primary components

###server.js: 
node + express server used primarily as a tool for exposing the monogodb over http, serving the client files and communicating with the client via cookies. Cookies are used to avoid asynchronous communication with the client.

for an hello world example of an express server see hello.js

###Client (lives in public/components/app.tag) 
app.tag is a riot component. Riot is a react-like view library with efficient runtime template compilation. React-like view libraries take a state tree and generate a html based representation of that state(state->ui). Changes in the UI are made by modifying the state tree and riot takes care of re-rendering the view into the dom. The has several advantages, first that application state is centralized creating a ‘single source of truth’ for the application. Second developers no longer need to describe all the view changes required to move from some state to any other valid state - they simply describe that a state mutation has occurred and Riot will take care of generating the required ui transitions. 

The first part of app.tag is a template describing the UI (similar to jinja).  The second is the state object (ie python map). All state is stored in this object. The rest of the file are functions that describe state changes and api interactions. 

note the size of app.tag is fairly large file, one of the main strengths of riot and similar systems is the ability to decompose the app into multiple components. If we were to add anymore features I would advocate decomposition. 

###CalculateFreeTimes.js
hold the business logic for calculating freetimes ie (startTime*endTime)*busy->free and formating for the state tree. 

##Lifecycle:
browser submits get request to server, responds with client files.

user interacts with dom, triggering updates the the client side state representation held in memory. 

When user is satisfied with proposal, a serialized json string with a subsection of the client state is submitted to the server via a post request. 

The server saves the proposal to the database, calculates a key for that proposal and returns it to the client. A cookie is also sent to the client for later identifying the owner of the proposal -this is non idea but avoids accounts. 

when a user navigates to url/cal/<key> the app.tag is again served but modifies its behavior to fit the requirements of editing a proposal etc.


##File Structure
node_modules: holds dependencies 
public: contains client files and sym link to node_modules that client depends on
src: In some places I used arrow functions and some es6 conveniences so I stored these files in src and compiled them with babel.js

package.json describes npm dependencies.

##Testing
I’ve used mocha for testing, nothing fancy.

run:  “mocha”

if you do not have mocha installed (the js test framework I've used) run

'npm install -g mocha' to install mocha.

note: I have included the required google credentials in this repo for convience, please do not reuse.















