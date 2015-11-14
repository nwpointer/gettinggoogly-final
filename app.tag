<App>
	<div show={(!state.authenticated)}>
		<span>Authorize access to Google Calendar API</span>
		{bar}
		<br>
		<button id="authorize-button" onclick={handleAuthClick}>Authorize</button>
	</div>
	<div show={(state.authenticated)}>
		<h3>Date Range</h3>
		<input name="daterange">
		<h3>Calandars</h3>
		<ul>
			<li each={state.calendars}>
				<input onchange={updateCalandarStatus} type="checkbox" checked={ enabled }> {title}
			</li>
		</ul>
		<h3>Busy Times</h3>
		<ul>
			<li each={state.events.filter(isBusy)}>
				{start.dateTime} - {end.dateTime}	
			</li>
		</ul>
	</div>

	<script>
		// INITIALIZATION
		
		self = this;
		// state is mutable and normalized
		state = {
			authenticated : false,
			calendars: [],
			calendarsIndexById:{},
			events:[],
			startDate:moment(),
			endDate:moment().add(7,'d')
		} 

		this.on('mount', function(){
			self.authorize(true);
			picker = $('input[name="daterange"]')
			picker.daterangepicker({
				start:state.startDate
			}, self.updateDateRange);
			picker.data('daterangepicker').setEndDate(state.endDate);
		})


		
		// UI UTILITY FUNCTIONS

		updateDateRange(s,e) {
			state.startDate = s;
			state.endDate   = e;
			console.log('start:', s.format(),'end:',e.format())
			getAllEvents();
		}

		handleAuthClick(event) {
			self.authorize(false)
	        return false;
		}

		updateCalandarStatus(e){
			e.item.enabled = e.srcElement.checked
			// getAllEvents();
			// self.update();
		}

		isBusy = function(event){
			index = state.calendarsIndexById[event.cId]
			return state.calendars[index].enabled
		}

		toggleAll = function(){
			state.calandars = state.calendars.map(function(v){
				v.enabled=!v.enabled
				return v;
			})
			self.update();
		}


		// API FUNCTIONS

		authorize(immediate){
			gapi.auth.authorize(
				{
					'client_id': CLIENT_ID,
					'scope': SCOPES.join(' '),
					'immediate': immediate
				},
				self.setAuthenticated
			);
		}

		setAuthenticated(res){
			state.authenticated = res && !res.error;
			if(state.authenticated){
				gapi.client.load('calendar', 'v3',listCalendars)
				self.update();	
			}
		}

		listCalendars = function(){
		  var request = gapi.client.calendar.calendarList.list({
		    'timeMin': (new Date()).toISOString(),
		    'orderBy': 'startTime',
		    'minAccessRole': "owner"
		  });

		  request.execute(function(resp){
		  	// console.log(resp.items)
		    state.calendars = resp.items.map(function(v,i){
		    	state.calendarsIndexById[v.id] = i
		    	return {id:v.id, title: v.summary, enabled:false}
		    })
		  	self.update();
		  	getAllEvents();
		  })
		}

		getAllEvents =function(){
			state.events = []
			state.calendars.map(function(c){
				listEvents(c.id)
			})
		}

		listEvents = function(cId){
			min = state.startDate.format("YYYY-MM-DDTHH:mm:ss") + '.000Z';
			max = state.endDate.format("YYYY-MM-DDTHH:mm:ss") + '.000Z';
			console.log('start:', min,'end:',max)
			console.log('2011-06-03T10:00:00.000Z')
			var request = gapi.client.calendar.events.list({
				timeMin: min,
				timeMax: max,
				"singleEvents" : true,
				"orderBy" : "startTime",
				calendarId:cId
			});

			request.execute(function(resp){
				// console.log(resp);
				console.log(resp.items.map(function(v){
					return v
					return v.start.dateTime
				}))
				state.events = state.events.concat(resp.items.map(function(v){
				  return {start: v.start, end:v.end, cId:cId}
				}));
				// console.log(foo);
				// state.events = state.events.concat(foo);
				self.update();
		  })
		}

		// $(document).ready(function() {
		//   $('input[name="daterange"]').daterangepicker();
		// });

	</script>

</App>