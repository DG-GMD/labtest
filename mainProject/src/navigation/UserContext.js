import React, {Component, useState} from 'react';

const UserContext = React.createContext();

export const UserProvider = ({ children }) => {
    const [isPop, setPop] = useState();
    
    return(
        <UserContext.Provider
            value={{
                isPop,
                setPop,
                showRefresh: () => {
                    console.log("refresh is ", isPop);
                },
                startMemorize: () => {
                    console.log("start memorize.. from UserContext");
                    setPop(true);
                }
            }}
        >
            {children}
        </UserContext.Provider>
    )
    
}

export const UserConsumer = UserContext.Consumer;


export default UserContext;