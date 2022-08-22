import {useState} from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useRouteMatch,
  useParams
} from "react-router-dom";
import './App.css';
import axios from 'axios';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState('visible');
  const [start, setStart] = useState('hidden');
  const [err, setErr] = useState('');


  const initReq = async () => {
    try {
      const response = await fetch('http://localhost:3000/', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
      setShow(prev => 'hidden');
      setStart(prev => 'visible');

      if (!response.ok) {
        throw new Error(`Error! status: ${response.status}`);
      }

    } catch (err) {
      setErr(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Router>
      <div>
        {err && <h2>{err}</h2>}
        <button onClick={initReq} style={{visibility: show}}>Start working</button>
        {isLoading && <h2>Loading...</h2>}
        <ul>
          <li>
            <Link to="/" style={{visibility: start}}>Home</Link>
          </li>
          <li>
            <Link to="/read_singers" style={{visibility: start}}>View all singers</Link>
          </li>
          <li>
            <Link to="/read_songs" style={{visibility: start}}>View all songs</Link>
          </li>
          <li>
            <Link to="/create_singer" style={{visibility: start}}>Create new singer</Link>
          </li>
          <li>
            <Link to="/create_song" style={{visibility: start}}>Create new song</Link>
          </li>
          <li>
            <Link to="/update_singer" style={{visibility: start}}>Update singer</Link>
          </li>
          <li>
            <Link to="/update_song" style={{visibility: start}}>Update song</Link>
          </li>
          <li>
            <Link to="/delete_song" style={{visibility: start}}>Delete song</Link>
          </li>
          <li>
            <Link to="/delete_singer" style={{visibility: start}}>Delete singer</Link>
          </li>
        </ul>

        <Routes>
          <Route path="/read_singers" element={<ReadSingers/>}/>
          <Route path="/read_songs" element={<ReadSongs/>}/>

          <Route path="/create_singer" element={<CreateSinger/>}/>
          <Route path="/create_song" element={<CreateSong/>}/>

          <Route path="/update_singer" element={<UpdateSinger/>}/>
          <Route path="/update_song" element={<UpdateSong/>}/>

          <Route path="/delete_singer" element={<DeleteSinger/>}/>
          <Route path="/delete_song" element={<DeleteSong/>}/>

          <Route path="/" element={<Home/>}/>
        </Routes>
      </div>
    </Router>
  );
};

function Home() {
  return <h2>Home</h2>;
}

function ReadSingers() {
  const [data, setData] = useState({data: []});
  const [name, setName] = useState(null);
  const [date, setDate] = useState(null);
  const [limit, setLimit] = useState(null);
  const [offset, setOffset] = useState(null);
  const [err, setErr] = useState('');

  const handleClick = async (e) => {
    e.preventDefault();
    let params = {name: name};

    if (date)
      params.date = date;

    if (limit)
      params.limit = limit;

    if (offset)
      params.offset = offset;

    try {
      const response = await axios.get('http://localhost:3000/read_singers', {
        headers: {
          Accept: 'application/json',
        },
        params: params
      });

      const result = response.data;
      setData({...data, data: result});
    } catch (err) {
      setErr(err.message);
    }
  };

  return (
    <div>
      {err && <h2>{err}</h2>}
      <h2>Read Singers</h2>
      <form onSubmit={handleClick}>
        <label>
          Singer Name:
          <input type="text" value={name} onChange={e => setName(e.target.value)} />
          Created At:
          <input type="text" value={date} onChange={e => setDate(e.target.value)} />
          Offset:
          <input type="text" value={offset} onChange={e => setOffset(e.target.value)} />
          Limit:
          <input type="text" value={limit} onChange={e => setLimit(e.target.value)} />
        </label>
        <input type="submit" value="Get singers" />
      </form>
        {data.data.map(singer => {
         return (
            <div key={singer.id}>
              <p>{singer.name}</p>
            </div>
          );
        })}
    </div>
  );
}

function ReadSongs() {
  const [data, setData] = useState({data: []});
  const [err, setErr] = useState('');
  const [name, setName] = useState(null);
  const [SingerId, setSingerId] = useState(null);
  const [date, setDate] = useState(null);
  const [limit, setLimit] = useState(null);
  const [offset, setOffset] = useState(null);

  const handleClick = async (e) => {
    e.preventDefault();
    let params = {};

    if (name)
      params.name = name;
      
    if (SingerId)
      params.SingerId = SingerId;

    if (date)
      params.date = date;

    if (limit)
      params.limit = limit;

    if (offset)
      params.offset = offset;

    try {
      const response = await axios.get('http://localhost:3000/read_songs', {
        headers: {
          Accept: 'application/json',
        },
        params: params
      });

      const result = response.data;
      setData({...data, data: result});
    } catch (err) {
      setErr(err.message);
    }
  };

  return (
    <div>
      {err && <h2>{err}</h2>}
      <h2>All Songs</h2>
      <form onSubmit={handleClick}>
        <label>
          Song Name:
          <input type="text" value={name} onChange={e => setName(e.target.value)} />
          Singer Id:
          <input type="text" value={SingerId} onChange={e => setSingerId(e.target.value)} />
          Created At:
          <input type="text" value={date} onChange={e => setDate(e.target.value)} />
          Offset:
          <input type="text" value={offset} onChange={e => setOffset(e.target.value)} />
          Limit:
          <input type="text" value={limit} onChange={e => setLimit(e.target.value)} />
        </label>
        <input type="submit" value="Get Songs" />
      </form>
      {data.data.map(song => {
         return (
            <div key={song.id}>
              <p>{song.name}</p>
              <p>{song['Singer.name']}</p>
              <br/>
            </div>
          );
        })}
    </div>
  );
}

function CreateSinger(){
  const [name, setName] = useState('');
  const [err, setErr] = useState('');

  const handleClick = async (e) => {
    e.preventDefault();

    try {
      await axios({
        method: 'post',
        url: 'http://localhost:3000/create_singer', 
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          name: name
        }
      });
    } catch (err) {
      setErr(err.message);
    }
  }

  return (
    <div>
      {err && <h2>{err}</h2>}
      <form onSubmit={handleClick}>
        <label>
          Name:
          <input type="text" value={name} onChange={e => setName(e.target.value)} />
        </label>
        <input type="submit" value="Create new singer" />
      </form>      
    </div>
  );
}

function CreateSong(){
  const [name, setName] = useState('');
  const [SingerId, setSingerId] = useState(null);
  const [err, setErr] = useState('');

  const handleClick = async (e) => {
    e.preventDefault();

    try {
      await axios({
        method: 'post',
        url: 'http://localhost:3000/create_song', 
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          name: name,
          SingerId: SingerId
        }
      });
    } catch (err) {
      setErr(err.message);
    }
  }

  return (
    <div>
      {err && <h2>{err}</h2>}
      <form onSubmit={handleClick}>
        <label>
          Name:
          <input type="text" value={name} onChange={e => setName(e.target.value)} />
          SingerId:
          <input type="text" value={SingerId} onChange={e => setSingerId(e.target.value)} />
        </label>
        <input type="submit" value="Create new song" />
      </form>      
    </div>
  );
}

function UpdateSinger(){
  const [name, setName] = useState('');
  const [id, setId] = useState(null);
  const [err, setErr] = useState('');

  const handleClick = async (e) => {
    e.preventDefault();

    try {
      await axios({
        method: 'patch',
        url: 'http://localhost:3000/update_singer', 
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          name: name,
          id: id
        }
      });
    } catch (err) {
      setErr(err.message);
    }
  }

  return (
    <div>
      {err && <h2>{err}</h2>}
      <form onSubmit={handleClick}>
        <label>
          Name:
          <input type="text" value={name} onChange={e => setName(e.target.value)} />
          Singer Id:
          <input type="text" value={id} onChange={e => setId(e.target.value)} />
        </label>
        <input type="submit" value="Update singer" />
      </form>      
    </div>
  );
}

function UpdateSong(){
  const [name, setName] = useState('');
  const [id, setId] = useState(null);
  const [SingerId, setSingerId] = useState(null);
  const [err, setErr] = useState('');

  const handleClick = async (e) => {
    e.preventDefault();

    try {
      await axios({
        method: 'patch',
        url: 'http://localhost:3000/update_song', 
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          name: name,
          SingerId: SingerId,
          id: id
        }
      });
    } catch (err) {
      setErr(err.message);
    }
  }

  return (
    <div>
      {err && <h2>{err}</h2>}
      <form onSubmit={handleClick}>
        <label>
          Name:
          <input type="text" value={name} onChange={e => setName(e.target.value)} />
        </label>
        <label>
          Singer Id:
          <input type="text" value={SingerId} onChange={e => setSingerId(e.target.value)} />
        </label>
        <label>
          Song Id:
          <input type="text" value={id} onChange={e => setId(e.target.value)} />
        </label>
        <input type="submit" value="Update Song" />
      </form>      
    </div>
  );
}

function DeleteSong(){
  const [id, setId] = useState(null);
  const [err, setErr] = useState('');

  const handleClick = async (e) => {
    e.preventDefault();

    try {
      await axios({
        method: 'delete',
        url: 'http://localhost:3000/delete_song', 
        headers: {
          'Content-Type': 'application/json'
        },
        data: {

          id: id
        }
      });
    } catch (err) {
      setErr(err.message);
    }
  }

  return (
    <div>
      {err && <h2>{err}</h2>}
      <form onSubmit={handleClick}>
        <label>
          Song Id:
          <input type="text" value={id} onChange={e => setId(e.target.value)} />
        </label>
        <input type="submit" value="Delete Song" />
      </form>      
    </div>
  );
}

function DeleteSinger(){
  const [id, setId] = useState(null);
  const [err, setErr] = useState('');

  const handleClick = async (e) => {
    e.preventDefault();

    try {
      await axios({
        method: 'delete',
        url: 'http://localhost:3000/delete_singer', 
        headers: {
          'Content-Type': 'application/json'
        },
        data: {

          id: id
        }
      });
    } catch (err) {
      setErr(err.message);
    }
  }

  return (
    <div>
      {err && <h2>{err}</h2>}
      <form onSubmit={handleClick}>
        <label>
          Singer Id:
          <input type="text" value={id} onChange={e => setId(e.target.value)} />
        </label>
        <input type="submit" value="Delete Singer" />
      </form>      
    </div>
  );
}

export default App;
