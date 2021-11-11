const express = require('express')
const app = express();
const cookieParser=require('cookie-parser');
const gettodo=require('./services/notion')
const PORT = 80;


//Google Auth

app.set('view engine', 'ejs');
app.use(express.json());
app.use(cookieParser());
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID='763631841563-221ja0ig4cucql6hotelfkdt280b4hmj.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);


app.post('/login', (req, res) => {
    let token = req.body.token;
    // console.log(token);
    async function verify() {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // console.log(payload)
  }
  verify()
  .then(()=>{
      res.cookie('session-token',token);
      res.send('success');
  })
  .catch(console.error);
})


//Routes

app.get('/',(req,res)=>{
    res.render('login')
})

app.get('/login', (req, res) => {
    res.render("login");
})

app.get('/todo', checkAuthenticated, async(req,res)=>{
    const todo=await gettodo()
    res.render('index',{todo:todo})
})

app.get('/profile', checkAuthenticated, (req, res)=>{
    let user = req.user;
    res.render('profile', {user});
})

app.get('/protectedroute',checkAuthenticated,(req,res)=>{
    res.render('protectedroute')
})

app.get('/logout',(req,res)=>{
    res.clearCookie('session-token');
    res.redirect('/login')
})

function checkAuthenticated(req, res, next){

    let token = req.cookies['session-token'];

    let user = {};
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = ticket.getPayload();
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
      }
      verify()
      .then(()=>{
          req.user = user;
          next();
      })
      .catch(err=>{
          res.redirect('/login')
      })

}
app.listen((process.env.PORT || PORT), () => {
	console.log(`The application started successfully on port ${PORT}`);
})
