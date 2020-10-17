import { Box, Footer, Grommet, Main, Text } from "grommet";
import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
// import { BuidlerSymfoniReact } from "./BuidlerSymfoniReact";
import { BuidlerContext } from "./buidler/BuidlerContext";
import { SimpleStorage } from './components/SimpleStorage';
import { Navigation } from './ui/Navigation';

function App() {

  // useEffect(() => {
  //   EmbarkJS.onReady((err: string | { message: string }) => {
  //     if (err) {
  //       // If err is not null then it means something went wrong connecting to ethereum
  //       // you can use this to ask the user to enable metamask for e.g
  //       if (typeof err === "string") {
  //         return setMessages(old => [...old, err])
  //       }
  //       if (typeof err === "object") {
  //         return setMessages(old => [...old, err.message])
  //       }
  //     }
  //     setEthereumReady(true)
  //   });
  // }, []);

  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Grommet>
        <BuidlerContext>
          <Box>
            {/* Navigation */}
            <Navigation></Navigation>
            {/* Content swtich */}
            <Main pad="large" height={{ min: "80vh" }} >
              <Switch>
                <Route exact path="/contracts/SimpleStorage">
                  <SimpleStorage />
                </Route>
              </Switch>
            </Main>
            {/* footer */}
            <Footer background="brand" pad="medium">
              <Text>Copyright Symfoni 2020</Text>
            </Footer>

          </Box>
        </BuidlerContext>
      </Grommet>
    </BrowserRouter >
  );
}

export default App;
