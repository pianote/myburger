import axios from '../../axios-orders';
import { put } from 'redux-saga/effects';
import * as actions from '../actions/index';

export function* initIngredientsSaga(action) {
    try {
        const res = yield axios.get('/ingredients.json')
        yield put(actions.setIngredients(res.data));
    }
    catch (err) {
        yield put(actions.fetchIngredientsFailed());
    }
}

