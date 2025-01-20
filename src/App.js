import './App.css';
import { useSession, useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react';
import DateTimePicker from 'react-datetime-picker';
import { useState } from 'react';
import { ReactTyped } from 'react-typed';
import { google } from './assets/icons';

function App() {
  const [ start, setStart ] = useState(new Date());
  const [ end, setEnd ] = useState(new Date());
  const [ eventName, setEventName ] = useState("");
  const [ eventDescription, setEventDescription ] = useState("");

  const session = useSession(); // tokens, when session exists we have a user
  const supabase = useSupabaseClient(); // talk to supabase!
  const { isLoading } = useSessionContext();
  
  if(isLoading) {
    return <></>
  }

  async function googleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar'
      }
    });
    if(error) {
      alert("Error logging in to Google provider with Supabase");
      console.log(error);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function createCalendarEvent() {
    console.log("Creating calendar event");
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
      }
    }
    await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        'Authorization':'Bearer ' + session.provider_token // Access token for google
      },
      body: JSON.stringify(event)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      alert("Event created, check your Google Calendar!");
    });
  }

  console.log(session);
  console.log(start);
  console.log(eventName);
  console.log(eventDescription);
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
