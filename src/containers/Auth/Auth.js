import React, { Component } from 'react';
import {connect} from 'react-redux';
import { Redirect } from 'react-router-dom';

import Input from '../../components/UI/Input/Input';
import Button from '../../components/UI/Button/Button';
import Spinner from '../../components/UI/Spinner/Spinner';
import classes from './Auth.module.css'
import * as actions from '../../store/actions/';


class Auth extends Component {
    state = {
        controls: {
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
        },
        isSignup: false,
        
    };

    componentDidMount() {
        if ( !this.props.buildingBurger && this.props.authRedirectPath !== '/'){
            this.props.onSetAuthRedirectPath();
        }
    }

    checkValidity(value, rules) {
        let isValid = true;
        if(!rules){
            return true;
        };
        if (rules.required) {
            isValid = value.trim() !== '' && isValid;
        };
        if(rules.minLength) {
            isValid = value.length >= rules.minLength && isValid;
        };
        if(rules.maxLength) {
            isValid = value.length <= rules.maxLength && isValid;
        };

        if (rules.isEmail) {
            const pattern = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            isValid = pattern.test(value) && isValid;
        }

        return isValid;
    }

    inputChangedHandler = (event, controlName) => {
        const updatedControls = {
            ...this.state.controls,
            [controlName]: {
                ...this.state.controls[controlName],
                value: event.target.value,
                valid: this.checkValidity(event.target.value, this.state.controls[controlName].validation),
                touched: true,
            }
        };
        this.setState({controls: updatedControls});
    }

    submitHandler = (event) => {
        event.preventDefault();
        this.props.onAuth(this.state.controls.email.value, this.state.controls.password.value, this.state.isSignup)
    }


    switchAuthModeHandler = () => {
        this.setState(prevState => {
            return { isSignup: !prevState.isSignup};
        })
    }

    render () {
        const formElementsArray = [];
        for (let key in this.state.controls) {
            formElementsArray.push({
                id: key,
                config: this.state.controls[key],
            })
        }

        let form = formElementsArray.map(formElement => (
            <Input 
                key={formElement.id}
                elementType={formElement.config.elementType}
                elementConfig={formElement.config.elementConfig}
                value={formElement.config.value}
                changed={(event) => this.inputChangedHandler(event, formElement.id)}
                invalid={!formElement.config.valid}
                shouldValidate={formElement.config.validation}
                touched={formElement.config.touched}
                errorMessage={formElement.config.errorMessage}
            />
            
        ))

        if(this.props.loading) {
            form = <Spinner />
        }

        let errorMessage = null;

        if (this.props.error) {
            errorMessage = (
                <small style={{color:'red', textTransform:'capitalize'}}>{this.props.error.message.split('_').join(' ').toLowerCase()}</small>
            );
        }

        let authRedirect = null;
        if (this.props.isAuthenticated) {
            // if (this.props.building) {
                authRedirect = <Redirect to={this.props.authRedirectPath} />
            // } else {
            //     authRedirect = <Redirect to="/checkout" />
            // }
            
        }

        return (
            <div className={classes.Auth}>
                {authRedirect}
                <h3 style={ { color: '#5C9210' }}>{!this.state.isSignup?'Sign In':'Sign Up Today!'}</h3>
                {errorMessage}                
                <form onSubmit={this.submitHandler}>
                    {form}
                    <Button btnType="Success">SUBMIT</Button>
                </form>
                <hr style={ { opacity: '0.3' }} />
                {this.state.isSignup 
                    ? ( <div>
                            <small style={{opacity:'0.3'}}>Aready have an account? </small>
                            <small><button onClick={this.switchAuthModeHandler} style={{color:'#5C9210'}}>Sign In</button></small>
                        </div>)
                    : ( <div>
                            <small style={{opacity:'0.3'}}>Don't have a account? </small>
                            <small><button onClick={this.switchAuthModeHandler} style={{color:'#5C9210'}}>Sign Up</button></small>
                        </div>)
                }
                {/* <small style={{opacity:'0.7'}}>Aready have an account? <button onClick={this.switchAuthModeHandler} style={{color:'green'}}>{this.state.isSignup? 'Sign In': 'Sign Up'}</button></small> */}
            </div>
        );
    }
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