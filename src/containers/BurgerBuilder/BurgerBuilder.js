import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as actions from '../../store/actions/index'; //'../../store/actions/index' automatically pick index.js

import Aux from '../../hoc/Aux/Aux';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import axios from '../../axios-orders';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';



export const BurgerBuilder = (props) => {
    
    const [purchasing, setPurchasing] = useState(false)

    const ings = useSelector(state => {
        return state.burgerBuilder.ingredients
    });
    const prc = useSelector(state => {
        return state.burgerBuilder.totalPrice
    });
    const err = useSelector(state => {
        return state.burgerBuilder.error
    });
    const isAuthenticated = useSelector(state => {
        return state.auth.token !== null
    });

    const dispatch = useDispatch();

    const onInitIngredients = useCallback(() => dispatch(actions.initIngredients()),[dispatch]);
    const onIngredientAdded = (igredientName) => dispatch(actions.addIngredient(igredientName));
    const onIngredientRemoved = (ingredientName) => dispatch(actions.removeIngredient(ingredientName));
    const onInitPurchased = () => dispatch(actions.purchaseInit());
    const onSetAuthRedirectPath = (path) => dispatch(actions.setAuthRedirectPath(path));
    
    useEffect(()=>{
        onInitIngredients();
    }, [onInitIngredients]);

    const updatePurchaseState = (ingredients) => {
        const sum = Object.keys(ingredients)
            .map(igKey => {
                return ingredients[igKey]
            })
            .reduce((sum, el) => {
                return sum + el;
            }, 0);
        return sum>0;
    }

    const purchaseHandler = () => {
        if (isAuthenticated) {
            setPurchasing(true)
        } else {
            onSetAuthRedirectPath('/checkout')
            history.push('/auth')
        }
    }

    const purchaseCancelHandler = () => {
        setPurchasing(false)
    }

    const {  history  } = props;
    const purchaseContinueHandler = () => {
        onInitPurchased();
        history.push({pathname:'/checkout'});
    }

    
    const disabledInfo = {
        ...ings
    };
    for (let key in disabledInfo) {
        disabledInfo[key] = disabledInfo[key] <= 0;
        //{salad:true,meat:false,...}
    }

    let orderSummary = null;
    let burger = err ? <p>Ingredients can't be loaded!</p> : <Spinner />;

    if (ings) {
        burger = (
            <Aux>
                <Burger ingredients={ings}/>
                <BuildControls
                    ingredientAdded={onIngredientAdded} 
                    ingredientRemoved={onIngredientRemoved}
                    disabled={disabledInfo}
                    purchasable={updatePurchaseState(ings)}
                    price={prc}
                    ordered={purchaseHandler}
                    isAuth={isAuthenticated}
                />
            </Aux>
        );

        orderSummary = <OrderSummary
            price={prc} 
            ingredients={ings}
            purchaseCanceled={purchaseCancelHandler}
            purchaseContinued={purchaseContinueHandler} />;
    }

    return (
        <Aux>
            <Modal show={purchasing} modalClosed={purchaseCancelHandler}>
                {orderSummary}
            </Modal>
            { burger }
        </Aux>
    );
}

export default withErrorHandler(BurgerBuilder, axios);