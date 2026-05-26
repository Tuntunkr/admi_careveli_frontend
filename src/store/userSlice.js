import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            // Add token to user object from localStorage if not present
            const token = localStorage.getItem("adminToken");
            state.user = {
                ...action.payload,
                token: action.payload?.token || token
            };
        },
    }
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;