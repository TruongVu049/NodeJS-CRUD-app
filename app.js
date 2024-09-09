const express = require("express");
const sql = require("mssql/msnodesqlv8");
const config = require("./config");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const appRoot = require("app-root-path");
const cors = require("cors");
const { Int } = require("msnodesqlv8");

const app = express();

// 👇️ configure CORS
app.use(cors());

app.use(express.json());
app.use(bodyParser.json());
app.use("/public/", express.static(path.join(__dirname, "/public")));

// // =================  ================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});
// Set saved storage options:
const upload = multer({ storage: storage });
app.post("/upload", upload.array("files"), (req, res) => {
  res.json({ message: "File(s) uploaded successfully" });
});

// ==================== get data cart =====================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/index.html"));
});
app.get("/upload", function (req, res) {
  res.sendFile(path.join(__dirname, "./views/upload.html"));
});
app.get("/dashboard", function (req, res) {
  res.sendFile(path.join(__dirname, "./views/dashboard.html"));
});
app.get("/dashboard/edit", function (req, res) {
  res.sendFile(path.join(__dirname, "./views/edit.html"));
});
app.get("/dashboard/create", function (req, res) {
  res.sendFile(path.join(__dirname, "./views/edit.html"));
});

// app.get("/product", async function (req, res) {
//   sql.connect(config, function (err) {
//     if (err) console.log(err);
//     var request = new sql.Request();
//     var query = `
//     select SANPHAM.SP_ID ,SANPHAM.Ten, LOAI.TenLoai, THUONGHIEU.TenTH, SANPHAM.Gia, SANPHAM.Img
//     from SANPHAM, LOAI, THUONGHIEU
//     where (SANPHAM.LOAI_ID = LOAI.LOAI_ID) and (SANPHAM.TH_ID = THUONGHIEU.TH_ID)

//       `;
//     request.query(query, function (err, records) {
//       if (err) console.log(err);
//       res.send(records.recordset);
//     });
//   });
// });

// get product none sort

app.get("/product/:page", async function (req, res) {
  let page = req.params.page;
  page = parseInt(page) * 6;
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    var query = `
    select * from
(SELECT *
	FROM SANPHAM
	ORDER BY (SELECT NULL AS NOORDER)
	OFFSET @PageNumber ROWS 
	FETCH NEXT 6 ROWS ONLY ) as Products,
	(select COUNT(*) as total from SANPHAM) as Total	
    `;
    request
      .input("PageNumber", sql.Int, page)
      .query(query, function (err, records) {
        if (err) console.log(err);
        res.send(records.recordset);
      });
  });
});

// get product has sort

app.get("/product/sort/:page/:sort", async function (req, res) {
  let page = req.params.page;
  let sort = req.params.sort;
  page = parseInt(page) * 6;
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    var query =
      sort.toLowerCase() === "asc"
        ? `
    select * from
(SELECT *
	FROM SANPHAM
	ORDER BY Gia asc
	OFFSET @PageNumber ROWS 
	FETCH NEXT 6 ROWS ONLY ) as Products,
	(select COUNT(*) as total from SANPHAM) as Total	
    `
        : `
    select * from
(SELECT *
	FROM SANPHAM
	ORDER BY Gia DESC
	OFFSET @PageNumber ROWS 
	FETCH NEXT 6 ROWS ONLY ) as Products,
	(select COUNT(*) as total from SANPHAM) as Total	
    `;
    request
      .input("PageNumber", sql.Int, page)
      .query(query, function (err, records) {
        if (err) console.log(err);
        res.send(records.recordset);
      });
  });
});

app.get("/product/search/:search", async function (req, res) {
  let search = req.params.search;
  search = `%${search}%`;
  console.log(search);
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    var query = `
    SELECT * 
    FROM SANPHAM 
    WHERE SANPHAM.Ten LIKE @searchName
    `;
    request
      .input("searchName", sql.NVarChar, search)
      .query(query, function (err, records) {
        if (err) console.log(err);
        res.send(records.recordset);
      });
  });
});

app.get("/products/:productId", async function (req, res) {
  let productId = req.params.productId;
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    var query = `
    SELECT Gia, Img, SANPHAM.LOAI_ID, SP_ID, TH_ID, Ten, TenLoai
    FROM SANPHAM, LOAI
    WHERE SANPHAM.LOAI_ID = LOAI.LOAI_ID AND SANPHAM.SP_ID = @ID 
    `;
    request
      .input("ID", sql.VarChar, productId)
      .query(query, function (err, records) {
        if (err) console.log(err);
        res.send(records.recordset);
      });
  });
});

app.get("/product", async function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    var query = `
    select * from
(SELECT *
	FROM SANPHAM
	ORDER BY (SELECT NULL AS NOORDER)
	OFFSET 0 ROWS 
	FETCH NEXT 6 ROWS ONLY ) as Products,
	(select COUNT(*) as total from SANPHAM) as Total	
      `;
    request.query(query, function (err, records) {
      if (err) console.log(err);
      res.send(records.recordset);
    });
  });
});
// ==============
app.get("/products/name/:thId/:productId", async function (req, res) {
  let productId = req.params.productId;
  let thId = req.params.thId;
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    var query = `
    select top 4 SANPHAM.TH_ID, THUONGHIEU.TenTH, SP_ID, Ten, Gia, LOAI_ID,Img
from THUONGHIEU, SANPHAM
where THUONGHIEU.TH_ID = SANPHAM.TH_ID and THUONGHIEU.TH_ID = @TH_ID and SANPHAM.SP_ID != @SP_ID
    `;
    request
      .input("TH_ID", sql.VarChar, thId)
      .input("SP_ID", sql.VarChar, productId)
      .query(query, function (err, records) {
        if (err) console.log(err);
        res.send(records.recordset);
      });
  });
});

app.get("/products/type/:loaiId/:productId", async function (req, res) {
  let productId = req.params.productId;
  let loaiId = req.params.loaiId;
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    var query = `
    select top 4 LOAI.LOAI_ID, TenLoai, SP_ID, Ten, Gia, SANPHAM.TH_ID, Img, TenTH
    from LOAI, SANPHAM, THUONGHIEU
    where LOAI.LOAI_ID = SANPHAM.LOAI_ID and THUONGHIEU.TH_ID = SANPHAM.TH_ID  and LOAI.LOAI_ID = @L_ID and SANPHAM.SP_ID != @SP_ID
    `;
    request
      .input("SP_ID", sql.VarChar, productId)
      .input("L_ID", sql.VarChar, loaiId)
      .query(query, function (err, records) {
        if (err) console.log(err);
        res.send(records.recordset);
      });
  });
});

// app.get("/product/:type", async function (req, res) {
//   let type = req.params.type;
//   sql.connect(config, function (err) {
//     if (err) console.log(err);
//     var request = new sql.Request();
//     var query = `
//     select *
//     from SANPHAM
//     where SANPHAM.LOAI_ID = @LOAI_ID
//     `;
//     request
//       .input("LOAI_ID", sql.VarChar, type)
//       .query(query, function (err, records) {
//         if (err) console.log(err);
//         res.send(records.recordset);
//       });
//   });
// });

app.delete("/product/:id", async function (req, res) {
  let id = req.params.id;
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    var query = `
    delete
    from CHITIETDH
    where CHITIETDH.SP_ID = @SP_ID

    delete
    from CHITIETCC
    where CHITIETCC.SP_ID = @SP_ID

    delete
    from CHITIETCL
    where CHITIETCL.SP_ID = @SP_ID

    delete
    from SANPHAM
    where SANPHAM.SP_ID = @SP_ID
    `;
    request
      .input("SP_ID", sql.VarChar, id)
      .query(query, function (err, records) {
        if (err) console.log(err);
        res.send(records);
      });
  });
});

app.post("/product", async function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    var query = `
      insert into SANPHAM(SP_ID, Ten, GIA, LOAI_ID, TH_ID, Img)
      values(@SP_ID, @Ten, @GIA, @LOAI_ID, @TH_ID, @Img)      
    `;
    request
      .input("SP_ID", sql.VarChar, req.body.SP_ID)
      .input("Ten", sql.NVarChar, req.body.Ten)
      .input("GIA", sql.Float, req.body.GIA)
      .input("LOAI_ID", sql.NVarChar, req.body.LOAI_ID)
      .input("TH_ID", sql.NVarChar, req.body.TH_ID)
      .input("Img", sql.VarChar, req.body.Img)
      .query(query, function (err, records) {
        if (err) console.log(err);
        res.send(records.recordset);
      });
  });
});

app.put("/product", async function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    var query = `
      update SANPHAM
      set SP_ID = @SP_ID, Ten = @Ten, GIA = @GIA, LOAI_ID = @LOAI_ID, TH_ID = @TH_ID, Img = @Img 
      where SP_ID = @SP_ID
    `;
    request
      .input("SP_ID", sql.VarChar, req.body.SP_ID)
      .input("Ten", sql.NVarChar, req.body.Ten)
      .input("GIA", sql.Float, req.body.GIA)
      .input("LOAI_ID", sql.NVarChar, req.body.LOAI_ID)
      .input("TH_ID", sql.NVarChar, req.body.TH_ID)
      .input("Img", sql.VarChar, req.body.Img)
      .query(query, function (err, records) {
        if (err) console.log(err);
        res.send(records.recordset);
      });
  });
});

// ========================================= query ================================

app.get("/query/1001", async function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    var query = `
    SELECT SANPHAM.SP_ID, SANPHAM.Ten, LOAI.TenLoai, SANPHAM.Gia
FROM SANPHAM, LOAI
WHERE SANPHAM.LOAI_ID = LOAI.LOAI_ID AND LOAI.TenLoai = 'Áo'
ORDER BY GIA ASC 
      `;
    request.query(query, function (err, records) {
      if (err) console.log(err);
      res.send(records.recordset);
    });
  });
});

app.get("/query/1002", async function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    var query = `
    select NHANVIEN_DONHANG.NV_ID, NHANVIEN_DONHANG.HoTen, NHANVIEN_DONHANG.email, sum(HOADON.TongTien) as TongTien
    from 
    (
      select NHANVIEN.NV_ID, NHANVIEN.HoTen, NHANVIEN.email, DONHANG.HD_ID
      from NHANVIEN, DONHANG
      where NHANVIEN.NV_ID = DONHANG.NV_ID
    ) as NHANVIEN_DONHANG, HOADON
    where NHANVIEN_DONHANG.HD_ID = HOADON.HD_ID
    group by NHANVIEN_DONHANG.NV_ID, NHANVIEN_DONHANG.HoTen, NHANVIEN_DONHANG.email
    having sum(HOADON.TongTien) > 1000000
    order by sum(HOADON.TongTien)
      `;
    request.query(query, function (err, records) {
      if (err) console.log(err);
      res.send(records.recordset);
    });
  });
});

app.get("/query/1003", async function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    var query = `
    select NHANVIEN.NV_ID, NHANVIEN.HoTen, NHANVIEN.email, count(DONHANG.DH_ID) as SL
from DONHANG, NHANVIEN
where DONHANG.NV_ID = NHANVIEN.NV_ID and (YEAR(DONHANG.NgayTao) = '2023' and MONTH(DONHANG.NgayTao) = '05')
group by NHANVIEN.NV_ID, NHANVIEN.HoTen, NHANVIEN.email
having count(DONHANG.DH_ID) >= 2
order by count(DONHANG.DH_ID)
      `;
    request.query(query, function (err, records) {
      if (err) console.log(err);
      res.send(records.recordset);
    });
  });
});

app.get("/query/1004", async function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    var query = `
    select CHATLIEU.CL_ID, CHATLIEU.TenCL, count(CHITIETCL.SP_ID) as SL
from CHATLIEU, CHITIETCL
where CHATLIEU.CL_ID = CHITIETCL.CL_ID
group by CHATLIEU.CL_ID, CHATLIEU.TenCL
order by count(CHITIETCL.SP_ID) desc
      `;
    request.query(query, function (err, records) {
      if (err) console.log(err);
      res.send(records.recordset);
    });
  });
});

// open
app.listen(5050, function () {
  console.log("Ung dung dang chay tren http://localhost:5050/dashboard");
});
