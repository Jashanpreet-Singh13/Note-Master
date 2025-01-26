const { Router } = require('express');
const router = Router();

const { isAuthenticated } = require("../middlewares/auth");

const User = require("../models/user");
const Note = require("../models/note");
const Contact = require("../models/contact");

router.get("/signup", (req, res) => {
    res.render('signup');
})

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const existingUsername = await User.findOne({username: username});
    if(existingUsername) {
      return res.status(400).json({msg: "Username already taken"});
    }

    const existingEmail = await User.findOne({email: email});
    if(existingEmail) {
      return res.status(400).json({msg: "Already signed up with this email"});
    }

    const user = new User({
      username: username,
      email: email,
      password: password,
    });
    await user.save();
    res.status(200).json({msg: "Signup Successfull"});
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});


router.get("/signin", (req, res) => {
    res.render('signin');
})

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(404).json({ msg: "Email Not Found" });
      return;
    }

    if (password !== user.password) {
      res.status(404).json({ msg: "Wrong Password" });
      return;
    }

    req.session.user = user.username;
    res.status(200).json({msg: "Signin Successfull"});
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/signin"));
}); 

router.get("/", isAuthenticated, (req, res) => {
    res.render('index' , { user: req.session.user });
})


router.get("/notes/home", isAuthenticated, async (req, res) => {
    console.log("req sess user : ", req.session.user);
    const notes = await Note.find({ username: req.session.user }).sort({pinned: -1, createdAt: -1});
    console.log("Notes : ", notes);
    res.render('homepage', {notes, user: req.session.user});
})


router.get("/notes/add-note", isAuthenticated, (req, res) => {
    res.render("addNote", { user: req.session.user });
})

router.post("/notes/add-note", isAuthenticated, async (req, res) => {
    try {
        const { title, content } = req.body;
        const username = req.session.user;
        const note = new Note({
            username: username,
            title: title,
            content: content
        });
        const response = await note.save();
        console.log("Note Saved");
        res.status(200).json({ msg: 'Note Added', note: response }); 
    } catch(err) {
        res.status(500).json({ err: "Server Error(err)" });
    }
})


router.post("/notes/delete/:id", isAuthenticated, async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.redirect("/notes/home");
});

router.get("/notes/update/:id", async (req, res) => {
    const note = await Note.findById(req.params.id);
    if(!note) {
        res.status(404).json({msg: "Note not Found"});
        return;
    }
    res.render('updateNote', { note });
});

router.post("/notes/update/:id", async (req, res) => {
    const { title, content } = req.body;
    const updatedNote = await Note.findByIdAndUpdate(req.params.id, { title, content } , {
        new: true,
        runValidators: true
    });
    if(!updatedNote) {
        res.status(404).json({msg: "Note not found"});
        return;
    }
    res.redirect("/notes/home");
})

router.get("/notes/search", async (req, res) => {
    const query = req.query.q;
    const regex = new RegExp(`^${query}`, "i");
    const notes = await Note.find({title: regex, username: req.session.user});
    console.log("Search = " + notes);
    res.status(200).json(notes);
})

router.post("/notes/pin/:id", async (req, res) => {
  const note = await Note.findById(req.params.id);
  if(!note) {
    res.status(404).json({msg: 'Note Not Found'});
  }

  note.pinned = !note.pinned;
  await note.save();
  res.redirect("/notes/home");
})

router.get("/contact", isAuthenticated, (req, res) => {
  res.render('contact');
})

router.get("/about", isAuthenticated, (req, res) => {
  res.render('about');
})

router.post("/contact", async (req, res) => {

  const { name, email, msg } = req.body;
  const newContactMsg = new Contact({name, email, msg});
  newContactMsg.save();
  res.status(200).json({msg: "Message Sent Successfully"});
});

module.exports = router;