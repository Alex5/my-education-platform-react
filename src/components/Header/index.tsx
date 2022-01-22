import React, {FC, useContext, useState} from 'react';
import {
    Button,
    ButtonGroup,
    Loading,
    Popover,
    Spacer,
    Link as GLInk,
    Text,
    User,
    useToasts,
    Avatar
} from "@geist-ui/react";
import styled from "styled-components";
import googleLogo from "../../assets/GoogleLogo.svg";
import {AuthContext} from "../../index";
import {useAuthState} from "react-firebase-hooks/auth";
import {AuthRequests} from "../../api/authRequests"
import {Link, useLocation, useNavigate} from "react-router-dom";
import HeaderMenu from "./HeaderMenu";
import {useDispatch, useSelector} from "react-redux";
import {getUser, setUser} from "../../redux/slices/userSlice/userSlice";
import {PublicRequests} from "../../api/publicRequests";
import {EStatus} from "../../redux/enums";
import AuthorTabs from "../Author/components/AuthorTabs";

interface HeaderProps {
    isAuthor: boolean;
}

const Header: FC<HeaderProps> = ({isAuthor}) => {
    const [load, setLoad] = useState(false);

    const dispatch = useDispatch();
    const {author} = useSelector(getUser);

    const {auth} = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [, setToast] = useToasts()
    const [user, loading] = useAuthState(auth);


    const login = (providerName: 'google' | 'github') => {
        AuthRequests
            .signIn(auth, providerName)
            .then((user) => {
                dispatch(setUser(user))
                setToast({
                    text: `Вход выполнен`,
                    type: 'success'
                })
            })
            .catch(err => {
                setToast({
                    text: `Ошибка входа: ${err}`,
                    type: 'error'
                })
            });
    }

    const transformToAuthor = async () => {
        setLoad(true)
        const updatedUser = await PublicRequests.transformAccount(user?.uid || '', EStatus.author);
        dispatch(setUser(updatedUser));
        setLoad(false)
    }

    return (
        <div style={{padding: '0 24px'}}>
            <StyledHeader author={author}>
                <StyledHeaderContent>
                    <Link to={"/"}>
                        <Text style={{fontFamily: 'TTNormsBold'}} mb={0} mt={0} h4>
                            My Education Platform
                        </Text>
                    </Link>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        {loading
                            ? <Loading mr={0} ml={0} width={10}/>
                            : user
                                ? <div style={{display: 'flex', alignItems: 'center'}}>
                                    {author
                                        ? !location.pathname.includes('/author') &&
                                        <Button scale={1 / 2} onClick={() => navigate('/author')} auto
                                                children="Панель автора"/>
                                        : <Button loading={load} onClick={transformToAuthor} scale={1 / 2}
                                                  type="secondary"
                                                  children="Стать автором"/>
                                    }
                                    <Spacer/>
                                    <Popover placement={"bottomEnd"} style={{cursor: 'pointer'}}
                                             content={<HeaderMenu isAuthor={isAuthor}/>}>
                                        <Avatar scale={1.8} src={user.photoURL != null ? user.photoURL : ''}/>
                                    </Popover>
                                </div>
                                : <StyledActions>
                                    <Button auto onClick={() => login('google')}
                                            icon={<img height={"17px"} src={googleLogo} alt="Google Logo"/>}/>
                                </StyledActions>
                        }
                    </div>
                </StyledHeaderContent>
                {location.pathname.includes('/author') && (
                    <StyledAuthorTabs>
                        <AuthorTabs/>
                    </StyledAuthorTabs>
                )}
            </StyledHeader>
        </div>

    );
};

const StyledHeader = styled.nav<{ author: boolean }>`
  display: flex;
  flex-direction: column;
  box-shadow: inset 0 -1px #eaeaea;
  width: 100%;
  background-color: white;
  max-width: 1048px;
  margin: auto;
`
const StyledHeaderContent = styled.div`
  justify-content: space-between;
  display: flex;
  max-width: 1048px;
  margin: auto;
  width: 100%;
  align-items: center;
  height: 80px;
`

const StyledActions = styled.div`
  display: flex;
  align-items: center;
`

const StyledAuthorTabs = styled.div`
  max-width: 1048px;
  margin: auto;
  width: 100%;
  height: 30px;
`

export default Header;