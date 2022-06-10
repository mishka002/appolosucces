const express = require('express')
const app = express()
const fs = require('file-system')
const multer = require("multer")
const moment = require('moment')
const dotenv = require('dotenv')
const nodemailer = require("nodemailer")
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const jsonfile = require('jsonfile');
const db = require('./db')
const path = require("path")
const os = require('os')


const ip = os.networkInterfaces();
console.log(ip)

dotenv.config({ path: './.env' })
app.use(bodyParser.urlencoded({
    extended: false
}));

var urlencodedParser = bodyParser.urlencoded({ extended: false })

moment.locale("ka");

const ftime = moment().format('LTS');
const t = moment().format('LT');
const d = moment().format('L');
const fulldate = `${t} სთ , ${d} წელი`

// random generators

function randomnames() {
    return Math.floor((Math.random() * 10000000) + 1);   
}
function randomsecurename() {
    var charsNumber   = "0123456789";
	var charsLower    = "abcdefghijklmnopqrstuvwxyz";
	var charsUpper    = "ABCDEFGHIJKLMNOPQRSTUVWXTZ";
	var charsAll      = [charsNumber,charsLower,charsUpper];

	var chars = charsAll.join('');
	var stringLength  = 8;
	var randomString  = '';
	for (var i = 0; i < stringLength; i++) {                               
		var randNum   = Math.floor(Math.random() * chars.length);  
		randomString  += chars.substring(randNum,randNum+1);   
	}

	return randomString; 
}
var deleted = randomsecurename() + 235
var edit = randomsecurename() + 20
var delmedia = randomsecurename() + 40
var review = randomsecurename()
// end


app.use(express.static('public'))
app.use(express.json())
app.use(expressLayouts);
app.set('layout', './layout/index')
app.set('view engine', 'ejs')

// routers

app.get("/", (req, res) => {
    res.render('home', { title: 'მთავარი || Appolo' })
})
app.get("/about", (req, res) => {
    res.render('about', { title: 'შესახებ || Appolo' })
})
app.get("/blogs", (req, res) => {
    db.query('SELECT * FROM blogs', function (error, results, fields) {
        let blogcount = ''
        let blogmodals = ''      
        let blognames = ''
        if (error) throw error;
        
        results.forEach(b => {
            blogcount = `
                ჯამში: ${results.length}</h2>
            `
            blognames += `
                <div class="col-md-4 col-sm-4">
                    <div class="gallery-thumb">
                        <div class="card ">
                            <div class="card-imgs">
                                <img src="../../blogimgs/${b.blogimgs}" class="card-img-top" alt="${b.blogimgs}">

                            </div>

                            <div class="card-body">
                                <h5 class="card-title">${b.blogname}</h5>
            
                                <a href="/blogs/review-${review}/${b.ID}" class="btn btn-primary" target="_blank" >ვრცლად</a>

                            </div>
                            <div class="card-footer">
                                <small class="text-muted">${b.insertdate}</small>
                            </div>
                        </div>
                    </div> 
                </div>` 
                app.get(`/blogs/review-${review}/${b.ID}`, (req, res) => {
                    db.query(`SELECT * FROM blogs WHERE ID = ${b.ID}`, function (error, results, fields) {
                        let revs = '';
                        if (!error) {
                            results.forEach(rev => {
                                revs += `
                                    <div class="getcenter dnone" id="read">
                                        <div class="revs">
                                            <div class="revimgs">
                                                <div class="backbtn"> 
                                                    <a href="/blogs">უკან</a>
                                                </div>
                                                <img src="../../blogimgs/${rev.blogimgs}" alt="${rev.blogimgs}">
                                            </div>
                                            <div class="revstxt">
                                                <div class="txt">
                                                    <h5 class="revs-title">
                                                        ${rev.blogname}
                                                        <span>${rev.insertdate}</span>
                                                    </h5>
                                                    <p class="revs-text">${rev.blogtxt} </p>
                                                </div>
                                                
                                            </div>
                                        </div>
                                        
                                    </div>
                            
                                `
                            })
                            res.render('blogs', {bloglist:"",blogcount: "",review: revs,title: 'ბლოგის ნახვა',layout: './layout/singleblog'});

                        }
        
                    })
                    
                })

            x = b.insertSqldate = '' 
 
            
        });
        if (results.length == 0) {
            blognames = `<div class="blognull ninomk">
            <div>
                <h3>ბლოგი არ მოიძებნება</h3>
            </div>
        </div>`
        }
        res.render('blogs', {blogmodals:blogmodals,blogcount: blogcount,bloglist:blognames,title: 'ბლოგები || Appolo'});
        
    })
})
app.get("/contact", (req, res) => {
    res.render('contact', {emailst:"გაგზავნა", title: 'კონტაქტი || Appolo' })
})
app.get("/admin", (req, res) => {
    res.render('./layout/loginadm', {ip:ip, title: 'პანელი || Appolo',layout: './layout/loginadm' })
})

// upload

function timedates() {
    return fulldate
}

let folderPaths = path.join(__dirname, '/public/blogimgs/')


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, folderPaths)
    },
    filename: function (req, file, cb) {
        x = randomnames()
        xxx = x + path.extname(file.originalname) 
        cb(null, x + path.extname(file.originalname))
    }
  })
const upload = multer({
    storage: storage
});

app.post('/admin',(req, res) => {
	// Capture the input fields
	let username = req.body.admname;
	let password = req.body.admpass;
    let ip_addrs = req.ip

    const logreport = {
        user: username,
        ip: ip_addrs,
        logdates: timedates()
    }
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		db.query('SELECT * FROM logins WHERE user = ? AND pass = ?', [username, password], function(err, results, fields) {
           

			// If there is an issue with the query, output the error
            if (err) {
               console.log(err);
            }
			// If the account exists
			if (results.length > 0) {
                db.query('INSERT INTO logreport SET ?', logreport)
                
                db.query('SELECT * FROM blogs', function (erro, results) {

                    let blogcounter = ''
                    let blogname = ''
                    
                    if (results.length > 0) {
                        results.forEach(b => {
                            blogcounter = `
                            <div class="alert alert-success" role="alert">
                                ბლოგთა ნუსხა საერთო ჯამში : ${results.length}</h2>
                            </div>`
    
                           
                            blogname += `
                            <div class="col">
                                    <div class="card">
                                        <p class="blogid">ID: ${b.ID}</p>
                                        <img src="../../blogimgs/${b.blogimgs}" class="card-img-top" alt="${b.blogimgs}">
                                        <div class="card-body">
                                            <h5 class="card-title">${b.blogname}</h5>
                                            <p class="card-text">${b.blogtxt}</p>
                                        </div>
                                        <div class="card-footer">
                                            <small class="text-muted">${b.insertdate}</small>
                                            <hr>
                                            <div class="blogsett">
                                                <a href="/admin/delete-${deleted}/${b.ID}" target="_blank" >წაშლა</a>
                                                <a href="/admin/edit-${edit}/${b.ID}" target="_blank">რედაქტირება</a>
                                                
                                            </div>
    
                                                
                                        </div>
                                    </div>
                                </div>      
                                
                                
                            `;
                            
                            x = b.insertSqldate = ''
                        })
                    }                    
                    else {
                        blogname = `
                            <div style="display: flex; align-items: center; justify-content: center;align-content: center;height: 100vh;width: 100%;">
                                <div class="alert alert-danger" role="alert">
                                    <h6>ბლოგი არ მოიძებნება , რაოდენობა 0</h6>
                                </div>
                            </div>
                        
                        `
                        blogcounter = ""
                    }
                    app.get(`/admin/medias`, (req, res)=> {

                        fs.readdir('public/blogimgs', (err, data) => {
                            let readf = ""
                            let datacount = ""
                     
                            data.forEach(y => {
                                datacount = `<div class="alert alert-success" role="alert">
                                    <h4>მედია ფაილები სულ: ${data.length}</h4>
                                </div>`
                                readf += `<figure class="figure">
                                    <img src="../../blogimgs/${y}" class="figure-img img-fluid rounded exten" alt="${y}">
    
                                    <figcaption class="figure-caption text-center p-2">
                                    <a href="/admin/delmedias-${delmedia}/${y}" target="_blank">
                                        <i class="fa-solid fa-trash-can"></i>
                                    </a>

                                    &ThinSpace;
                                    სახელი: ${y}</figcaption>
                                </figure>`

                                app.get(`/admin/delmedias-${delmedia}/${y}`, (req, res) => {
                                    
                                    fs.unlink(`public/blogimgs/${y}`, function (err) {
                                        
                                        let delstatus = ''
                                        if (!err) {
                                            delstatus = `<div class="alert alert-success" role="alert">
                                                            <h4><i class="fa-solid fa-check"></i> &ThinSpace; მედია ფაილი წაიშალა: ${y}</h4>
                                                        </div>`
                                        
                                        }
                                        else {
                                            delstatus = `<div class="alert alert-danger" role="alert">
                                                            <h4><i class="fa-solid fa-xmark"></i> &ThinSpace; მედია ფაილი არ წაიშალა: ${y}</h4>
                                                        </div>`
                                          
                                        }
                                        res.render('admin', {title: "მედია ფაილები",delstatus:delstatus, layout: './layout/del'});

                                    });
            
                                })

                            })
                            if (data.length == 0) {
                                readf = `
                                <div style="display: flex; align-items: center; justify-content: center;align-content: center;height: 100vh;width: 100%;">
                                    <div class="alert alert-danger" role="alert">
                                        <h6>მედია არ მოიძებნება , რაოდენობა 0</h6>
                                    </div>
                                </div>`
                            }
                            res.render('admin', {datacount: datacount,readfile:readf,title: 'მედია ფაილები', layout: './layout/mediafiles'});
                            
                            

                        });
                    })

                    
                    
                    
    				res.render('admin', {blogcount:blogcounter,blogs:blogname,fulldate: fulldate,blogalert: " ", layout: './layout/admpanel'});
                
                    app.get(`/admin/delete-${deleted}/:id`, (req, res) => {

                        let deleted =  `<div class="alert alert-success" role="alert">
                            <h2>წაიშალა ბლოგი დრო: (${fulldate})</h2>
                        </div>`
                        let delnot = `<div class="alert alert-danger" role="alert">
                            <h2>არ წაიშალა ბლოგი დრო: (${fulldate})</h2>
                        </div>`
                        db.query('DELETE FROM blogs WHERE ID = ? ', [req.params.id], function(err, rows, fields) {
                            if (!err) {
                                res.render('admin', {title: "წაიშალა ბლოგი ",delstatus:deleted, layout: './layout/del'});
    				            

                               
                            }
                            else {
                                console.log(err);
                                res.render('admin', {title: "არ წაიშალა ბლოგი ",delstatus:delnot, layout: './layout/del'});
                                
                            }
                        })
                    })

                    app.get(`/admin/edit-${edit}/:id`, (req, res) => {

                        
                        db.query(`SELECT * FROM blogs WHERE ID = ${req.params.id}`, function (error, results, fields) {
                            
                            if (error) throw error;
                            
                                
                            let blognames = '';
                            let blogimgs = '';
                            let blogfilter = '';
                            let blogtxt = '';
                            results.forEach(n => {
                                blognames = n.blogname
                                blogimgs = n.blogimgs
                                blogfilter = n.blogfilter
                                blogtxt = n.blogtxt
                            })

                            console.log("fg" + blognames);

                            
                            res.render('admin', {title: "რედაქტირება ბლოგის ",editnum:req.params.id,blognm:blognames, blogig:blogimgs , blogft:blogfilter , blogtxt:blogtxt ,layout: './layout/editing'});
                              
                        });
                        
                    })
                    
                    
                })
                app.post(`/e`,upload.array("blogimgs", 2), (req, res) => {
                    let blogimgs = xxx
                    
                    let editok =  `<div style="color:green">
                        <h2>ბლოგი დარექდატირდა</h2>
                    </div>`
                    let editno = `<div style="color:darkred">
                        <h2>არ დარექდატირდა ბლოგი: ${req.params.id}</h2>
                    </div>`
                   
                    
                    db.query(`UPDATE blogs SET
                            blogname  = '${req.body.bloghead}',
                            blogfilter = '${req.body.blogfilter}',
                            blogtxt = '${req.body.blogtxt}',
                            blogimgs = '${blogimgs}',
                            insertdate = '${fulldate}'
                            WHERE ID = ${req.body.blogid} `, function(err, rows, fields) {
                        if (!err) {
                            console.log("inserted succ")

                            res.render('admin', {title: "წარმატებით რედაქტირდა" ,editstatus:editok, layout: './layout/editstatus'});
                             
                            
                        }
                        else {
                            console.log(err);                             
                            res.render('admin', {title: "არ რედაქტირდა" ,editstatus:editno, layout: './layout/editstatus'});
                                                         
                        }
                    })
                   
                    
                })
                    
                app.post('/blog', upload.array("blogimgs", 2),(req, res) => {
                    let blogimgs = xxx
                    let bloghead = req.body.bloghead
                    let blogfilter = req.body.blogfilter
                    let blogtxt = req.body.blogtxt
                    
                    const params = {
                        blogname: bloghead,
                        blogfilter: blogfilter,
                        blogtxt: blogtxt,
                        blogimgs:blogimgs,
                        insertdate: fulldate

                    }
                   
                    let blogadd = `<div class="alert alert-success alert-dismissible fade show" role="alert">
                                        <strong>ბლოგი დაემატა!</strong> შეგიძლია ნახო  <a href="/blogs" target="_blank" class="alert-link"> CLICK</a>.
                                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                    </div>`
                    let blognot = `<div class="alert alert-danger" role="alert">
                                        ბლოგი არ დაემატა: ${fulldate} 
                                    </div>`
                  
                    db.query('INSERT INTO blogs SET ?', params , (err, rows) => {
                        
                        if(!err) {

                            db.query('SELECT * FROM blogs', function (error, results, fields) {
                                let blogcounter = ''
                                
                                let blognames = ''
                                if (error) throw error;
                                
                                results.forEach(b => {
                                    blogcounter = `
                                    <div class="alert alert-success" role="alert">
                                        ბლოგთა ნუსხა საერთო ჯამში : ${results.length}</h2>
                                    </div>`

                                    blognames += `
                                        <div class="col">
                                            <div class="card">
                                                <img src="../../blogimgs/${b.blogimgs}" class="card-img-top" alt="${b.blogimgs}">
                                                <div class="card-body">
                                                    <h5 class="card-title">${b.blogname}</h5>
                                                    <p class="card-text">${b.blogtxt}</p>
                                                </div>
                                                <div class="card-footer">
                                                    <small class="text-muted">${b.insertdate}</small>
                                                    <hr>
                                                    <div class="blogsett">
                                                    <a href="/admin/delete-${deleted}/${b.ID}" target="_blank" >წაშლა</a>
                                                    <a href="/admin/edit-${edit}/${b.ID}" target="_blank">რედაქტირება</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>      
            
                                    `;
                                 
                                    x = b.insertSqldate = '' 
                                    
                                });
                                res.render('admin', {blogcount: blogcounter,blogs:blognames,fulldate: fulldate,blogalert: blogadd, layout: './layout/admpanel'});
                                
                                  
                            });

            
                        } else {
                            console.log("ipaaa " + err)
				            res.render('admin', {fulldate: fulldate,blogalert: blognot, layout: './layout/admpanel'});

                        }
            
                    })
                })
				
			} else {
				res.send('Incorrect Username and/or Password!');
			}			
		});

	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
});

// end

// send mail

app.post('/contact',urlencodedParser, (req, res) => {
  
    const transporter = nodemailer.createTransport({
        host: process.env.host,
        port: process.env.port,
        secure: true,
        auth: {
          user: process.env.usermail,
          pass: process.env.passuser,
        },
    });
    const mailOptions = {
        // attachments: [{
        //     filename: 'i1.jpg',
        //     path: "imgs/i1.jpg",
        //     cid: 'imgs/i1.jpg' //same cid value as in the html img src
        // }],

        from: req.body.name,
        to: 'support@appolosuccess.ge , mishiko.kuprava20@gmail.com',
        subject: `${req.body.subject}`,
        text: `message from: ${req.body.name}(${req.body.email}),\nmessage: ${req.body.message}`,
        html: `<div style="background: #ddd;color:#2c363a;padding:1rem;border-radius:5px;">
                    <h4>გამომგზავნი: ${req.body.name}</h4>
                    <h4>გამომგზავნის მეილი: ${req.body.email}</h4>
                    <h4>გამომგზავნის შეტყობინება: ${req.body.message}</h4>
                </div>`,
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (!error) {
            res.render('contact', {emailst:"გაიგზავნა", title: "გაიგზავნა" })
        }
        else {
            
            res.render('contact', {emailst:"არ გაიგზავნა", title: "არ გაიგზავნა" })

        }
    })
})
const hostname = "127.0.0.9";
const port = 3000;
app.listen(port, hostname, function () {
    console.log(`Server running at http://${hostname}:${port}/`);
    console.log(`On time: ${ftime}`);
})