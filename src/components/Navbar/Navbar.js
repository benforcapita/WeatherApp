import React,{ useState }  from 'react';
import Nav from 'react-bootstrap/Nav';
import 'bootstrap/dist/css/bootstrap.min.css';


const Navbar = (props) => {
let [Page, setPage] = useState('');
return(<Nav className="justify-content-end" defaultActiveKey="/home">
    <Nav.Item>
      <Nav.Link onClick={()=> setPage('main')} eventKey="link-1" disabled ={Page ==='main'} >main</Nav.Link>
    </Nav.Item>
    <Nav.Item>
      <Nav.Link  onClick={()=> setPage('favorites')} eventKey="link-2" disabled ={Page ==='favorites'} > favorites </Nav.Link>
    </Nav.Item>
  </Nav>
)
}

export default Navbar;