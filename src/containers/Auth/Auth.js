import React, { useState, useEffect } from 'react';
import {connect} from 'react-redux';
import { Redirect } from 'react-router-dom';
import { updateObject, checkValidity } from '../../shared/utility';

import Input from '../../components/UI/Input/Input';
import Button from '../../components/UI/Button/Button';
import Spinner from '../../components/UI/Spinner/Spinner';
import classes from './Auth.module.css'
import * as actions from '../../store/actions/';



const Auth = (props) => {
    const [controls, setControls] = useState({
        email: {
            elementType: 'input',
            elementConfig: {
                type: 'email',
                placeholder: 'Email',
            },
            value: '',
            validation: {
                required: true,
                isEmail: true,
            },
            valid: false,
            touched: false,
            errorMessage: "Invalid Email",
        },
        password: {
            elementType: 'input',
            elementConfig: {
                type: 'password',
                placeholder: 'Password',
            },
            value: '',
            validation: {
                required: true,
                minLength: 6,
            },
            valid: false,
            touched: false,
            errorMessage: "Invalid Password",
        },
    });
    const [isSignup, setIsSignup] = useState(false);

    const { buildingBurger, authRedirectPath, onSetAuthRedirectPath } = props;
    useEffect(()=>{
        if ( !buildingBurger && authRedirectPath !== '/'){
            onSetAuthRedirectPath();
        }
    }, [buildingBurger, authRedirectPath, onSetAuthRedirectPath])

    const inputChangedHandler = (event, controlName) => {
        const updatedControls = updateObject(controls, {
            [controlName]: updateObject(controls[controlName], {
                value: event.target.value,
                valid: checkValidity(event.target.value, controls[controlName].validation),
                touched: true,
            })
        }); 
        setControls(updatedControls) 
    }

    const submitHandler = (event) => {
        event.preventDefault();
        props.onAuth(controls.email.value, controls.password.value, isSignup);
    }


    const switchAuthModeHandler = () => {
        setIsSignup(!isSignup);
    }

    const formElementsArray = [];
    for (let key in controls) {
        formElementsArray.push({
            id: key,
            config: controls[key],
        })
    }

    let form = formElementsArray.map(formElement => (
        <Input 
            key={formElement.id}
            elementType={formElement.config.elementType}
            elementConfig={formElement.config.elementConfig}
            value={formElement.config.value}
            changed={(event) => inputChangedHandler(event, formElement.id)}
            invalid={!formElement.config.valid}
            shouldValidate={formElement.config.validation}
            touched={formElement.config.touched}
            errorMessage={formElement.config.errorMessage}
        />
        
    ))

    if(props.loading) {
        form = <Spinner />
    }

    let errorMessage = null;

    if (props.error) {
        errorMessage = (
            <small style={{color:'red', textTransform:'capitalize'}}>{props.error.message.split('_').join(' ').toLowerCase()}</small>
        );
    }

    let authRedirect = null;
    if (props.isAuthenticated) {
        // if (props.building) {
            authRedirect = <Redirect to={props.authRedirectPath} />
        // } else {
        //     authRedirect = <Redirect to="/checkout" />
        // }
        
    }

    return (
        <div className={classes.Auth}>
            {authRedirect}
            <h3 style={ { color: '#5C9210' }}>{!isSignup?'Sign In':'Sign Up Today!'}</h3>
            {errorMessage}                
            <form onSubmit={submitHandler}>
                {form}
                <Button btnType="Success">SUBMIT</Button>
            </form>
            <hr style={ { opacity: '0.3' }} />
            {isSignup 
                ? ( <div>
                        <small style={{opacity:'0.3'}}>Aready have an account? </small>
                        <small><button onClick={switchAuthModeHandler} style={{color:'#5C9210'}}>Sign In</button></small>
                    </div>)
                : ( <div>
                        <small style={{opacity:'0.3'}}>Don't have a account? </small>
                        <small><button onClick={switchAuthModeHandler} style={{color:'#5C9210'}}>Sign Up</button></small>
                    </div>)
            }
            {/* <small style={{opacity:'0.7'}}>Aready have an account? <button onClick={switchAuthModeHandler} style={{color:'green'}}>{isSignup? 'Sign In': 'Sign Up'}</button></small> */}
        </div>
    );
}

const mapStateToProps = state => {
    return {
        loading: state.auth.loading,
        error: state.auth.error,
        isAuthenticated: state.auth.token !== null,
        buildingBurger: state.burgerBuilder.building,
        authRedirectPath: state.auth.authRedirectPath,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onAuth: ( email, password, isSignup ) => dispatch( actions.auth( email, password, isSignup )),
        onSetAuthRedirectPath: () => dispatch(actions.setAuthRedirectPath('/')),
    };
};

export default connect( mapStateToProps, mapDispatchToProps )( Auth );