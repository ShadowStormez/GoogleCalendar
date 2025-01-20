import './App.css';
import { useSession, useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react';
import DateTimePicker from 'react-datetime-picker';
import { useState } from 'react';
import { ReactTyped } from 'react-typed';
import { google } from './assets/icons';

function App() {
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [attendees, setAttendees] = useState(""); // For input field
  const [attendeeList, setAttendeeList] = useState([]); // For list of attendees

  const session = useSession(); // tokens, when session exists we have a user
  const supabase = useSupabaseClient(); // talk to supabase!
  const { isLoading } = useSessionContext();

  if (isLoading) {
    return <></>;
  }

  async function googleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar'
      }
    });
    if (error) {
      alert("Error logging in to Google provider with Supabase");
      console.log(error);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function createCalendarEvent() {
    console.log("Creating calendar event");

    // Use the attendeeList array for the attendees
    const event = {
      'summary': eventName,
      'description': eventDescription,
      'start': {
        'dateTime': start.toISOString(),
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      'end': {
        'dateTime': end.toISOString(),
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      'attendees': attendeeList.map(email => ({ 'email': email })),
      'sendUpdates': 'externalOnly',
    };

    await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        'Authorization': 'Bearer ' + session.provider_token // Access token for Google
      },
      body: JSON.stringify(event)
    })
      .then((data) => data.json())
      .then((data) => {
        console.log(data);
        alert("Event created, check your Google Calendar!");
      });
  }

  const handleAddAttendee = () => {
    // Split the emails, trim spaces, and add to attendeeList
    const emails = attendees.split(',').map(email => email.trim()).filter(email => email);
    setAttendeeList(prevList => [...prevList, ...emails]);
    setAttendees(""); // Clear the input field
  };

  const handleRemoveAttendee = (email) => {
    setAttendeeList(prevList => prevList.filter(item => item !== email));
  };

  return (
    <div className="App">
      {!session ?
        <ReactTyped
          strings={['Schedule events with <span style="color:#4FFFB0; font-weight: bold;">Google</span> !']}
          typeSpeed={50}
          backSpeed={50}
          backDelay={1000}
          startDelay={500}
          loop={false}
          showCursor={true}
        /> :
        <ReactTyped
          strings={[`Hey there <span style="color:#4FFFB0; font-weight: bold;">${session.user.email}</span>`]}
          typeSpeed={50}
          backSpeed={50}
          backDelay={1000}
          startDelay={500}
          loop={false}
          showCursor={true}
        />
      }

      <div className='content'>
        {session ?
          <>
            <p>Start of your event</p>
            <DateTimePicker onChange={setStart} value={start} />
            <p>End of your event</p>
            <DateTimePicker onChange={setEnd} value={end} />
            <p>Event name</p>
            <input className='input' type="text" onChange={(e) => setEventName(e.target.value)} />
            <p>Event description</p>
            <input className='input' type="text" onChange={(e) => setEventDescription(e.target.value)} />
            <p>Attendees</p>
            <div className="attendees-input-container">
              <input
                className="input"
                type="text"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                placeholder="Enter emails"
                style={{fontSize:'14px',margin: '10px 0'}}
              />
              <button onClick={handleAddAttendee} className="button button-add">Add</button>
            </div>
            {attendeeList.length > 0 && (
              <div className="attendee-list">
                {attendeeList.map((email, index) => (
                  <div key={index} className="attendee-item">
                    {email}
                    <button
                      onClick={() => handleRemoveAttendee(email)}
                      className="remove-attendee-btn"
                    >
                      ✖
                    </button>
                  </div>
                ))}
              </div>
            )}
            <hr />
            <button className='button button-calendarEvent' onClick={() => createCalendarEvent()}>Create Calendar Event</button>
            <p></p>
            <button className='button-signout' onClick={() => signOut()}>Sign Out</button>
          </>
          :
          <>
            <button className='button' onClick={() => googleSignIn()}>Sign In With Google<img src={google} width={24} height={24} alt="icon" /></button>
          </>
        }
      </div>
    </div>
  );
}

export default App;
