import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import MainIndex from './Main';
import Contact from './Contact';
import Login from './Login';
import Admin from './Admin';
import Cuestionario1 from './Cuestionario1';
import Cuestionario2 from './Cuestionario2';


ReactDOM.render(
	<BrowserRouter>
		<Switch>
			<Route exact path="/" component={MainIndex}/>
			<Route exact path="/contact" component={Contact}/>
			<Route exact path="/login" component={Login}/>
			<Route exact path="/cuestionario1" component={Cuestionario1}/>
			<Route exact path="/cuestionario2" component={Cuestionario2}/>
			<Route exact path="/admin" component={Admin}/>
		</Switch>
	</BrowserRouter>,
	document.getElementById('root')
);
registerServiceWorker();
