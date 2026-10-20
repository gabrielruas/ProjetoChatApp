import './App.css';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import { Home } from './paginas/Home/Home';
import { Usuarios } from './paginas/Usuarios/Usuarios';
import { Atendimento } from './paginas/Atendimento/Atendimento';
import { Mensagem } from './paginas/Mensagem/Mensagem';
import { NovoUsuario } from './paginas/NovoUsuario/NovoUsuario';
import { EditarUsuario } from './paginas/EditarUsuario/EditarUsuario';

function App() {
  return (
   <BrowserRouter>
    <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/usuarios' element={<Usuarios />}/>
        <Route path='/atendimento' element={<Atendimento />}/>
        <Route path='/mensagem' element={<Mensagem />}/>
        <Route path='/usuario/novo' element={<NovoUsuario />}/>
        <Route path='/usuario/editar' element={<EditarUsuario />}/>
    </Routes>
   </BrowserRouter>
  );
}

export default App;
