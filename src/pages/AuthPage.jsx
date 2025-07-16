import {createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword,} from "firebase/auth"
import { useContext, useEffect, useState } from "react"
import {Button, Col, Form, Image, Modal, Row} from "react-bootstrap"
import {useNavigate} from "react-router-dom"
import {AuthContext} from "../components/AuthProvider";

export default function AuthPage(){
    const[modalShow, setModalShow] = useState(null);
    const handleShowSignUp = () => setModalShow("signup")
    const handleShowLogin= () => setModalShow("login")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate();
    const auth = getAuth()
    const [error, setError] = useState("");
    const {currentUser} = useContext(AuthContext)
    useEffect(()=> {
        if( currentUser) navigate("/profile")
    },[currentUser, navigate])


const handleSignUp = async (e) => {
    e.preventDefault()
    try{
        const res = await createUserWithEmailAndPassword(auth, username, password)
        console.log(res.user)
    } catch(error) {
        console.error(error)

    }
}

const handleLogin = async (e) => {
    e.preventDefault();
    try{
        await signInWithEmailAndPassword(auth, username, password);
    } catch(error) {
        console.error(error)
        setError("Username and/or Password is incorrect")
    }
}

const handleClose = () => {
    setModalShow(null)
    setError("")
}

return(
    <div>
        <Button className="rounded-pill" onClick={handleShowSignUp}>
            Create Account
          </Button>
          <p className={{ fontSize: 12 }}>
            By signing up, vou agree to the Terms of Service and Privacy Policy
            including Cookie Use
          </p>

          Already have an account?
          
          <Button
            className="rounded-pill"
            variant="outline-primary"
            onClick={handleShowLogin}
          >
            Sign In
          </Button>
        <Modal
          show={modalShow !== null}
          onHide={handleClose}
          animation={false}
          centered
        >
          <Modal.Body>
            <h2 className="mb-4" style={{ fontWeight: "bold" }}>
              {modalShow === "signUp"
                ? "Create your account"
                : "Log in you your account"}
            </h2>
            <Form
              className="d-grid gap-2 px-5"
              onSubmit={modalShow === "signUp" ? handleSignUp : handleLogin}
            >
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Control
                  type="email"
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter email"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Control
                  type="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                />
              </Form.Group>
              <p> {error} </p>

              <p style={{ fontSize: "12px" }}>
                By signing up, you agree to the Terms of Service and Privacy
                Policy, including Cookie Use. SigmaTweets may use your contact
                information, including your email address and phone number for
                purposes outlined in our Privacy Policy, like keeping your
                account seceure and personalising our services, including ads.
                Learn more. Others will be able to find you by email or phone
                number, when provided, unless you choose otherwise here.
              </p>
              <Button className="rounded-pill" type="submit">
                {modalShow === "signUp" ? "Sign Up" : "Log in"}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

    </div>
    
)}