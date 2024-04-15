import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE } from '../Actions/authActions/actionTypes';

const initialState = {
    loading: false,
    error: null,
    loggedIn: false
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOGIN_REQUEST:
            return {
                ...state,
                loading: true,
                error: null
            };
        case LOGIN_SUCCESS:
            return {
                ...state,
                loading: false,
                error: null,
                loggedIn: true
            };
        case LOGIN_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
                loggedIn: false
            };
        default:
            return state;
    }
};

export default authReducer;