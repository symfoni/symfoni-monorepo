import React from 'react';
import { Box, Header, Heading } from 'grommet';
import { Link, useHistory } from 'react-router-dom';
import { Account } from '../components/Account';

interface Props { }

export const Navigation: React.FC<Props> = () => {
    const history = useHistory();
    return (
        <Header background="brand" pad="small">
            <Box>
                <Heading level="1" style={{ cursor: "pointer" }} onClick={() => history.push("/")}>Demo</Heading>
            </Box>
            <Box direction="row" gap="small">
                <Link to="/contracts/SimpleStorage">SimpleStorage</Link>
                <Account></Account>
            </Box>
        </Header>
    )
}