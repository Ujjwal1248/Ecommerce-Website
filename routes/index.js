const express = require("express");
const passport = require("passport");
const localStrategy = require("passport-local");
const router = express.Router();
const userModel = require("./users");
const productModel = require("./products");
const saleModel = require("./sale");
const upload = require("./multer");

// Configure passport
passport.use(new localStrategy(userModel.authenticate()));

//Middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}

// Home and Authentication Routes
// Home route
router.get("/", (req, res) => {
  res.render("index", { footer: false });
});

// Authentication routes
router.get("/login", (req, res) => {
  res.render("login", { footer: false });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/shop",
    failureRedirect: "/login",
  })
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  const user = new userModel({
    fullName: req.body.fullName,
    username: req.body.username,
    email: req.body.email,
  });

  userModel.register(user, req.body.password).then((registeredUser) => {
    passport.authenticate("local")(req, res, () => {
      res.redirect("/profile");
    });
  });
});

//User Routes
router.get("/profile", isLoggedIn, (req, res) => {
  res.render("profile", { user: req.user });
});

router.get("/cart", isLoggedIn, async (req, res) => {
  const user = await userModel
    .findOne({ email: req.user.email })
    .populate("cart.product");

  let totalPrice = 0;
  user.cart.forEach((item) => {
    totalPrice += item.product.pPrice * item.quantity;
  });

  res.render("cart", { user, cartItems: user.cart, totalPrice });
});

router.get("/shop", isLoggedIn, async (req, res) => {
  const products = await productModel.find();
  res.render("shop", { products });
});

router.get("/addtocart/:productID", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({ email: req.user.email });
  const cartItem = user.cart.find(
    (item) => item.product.toString() === req.params.productID
  );

  if (cartItem) {
    cartItem.quantity += 1;
  } else {
    user.cart.push({ product: req.params.productID });
  }

  await user.save();
  res.redirect("/shop");
});

router.post("/removeFromCart/:productID", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({ email: req.user.email });
  const cartItemIndex = user.cart.findIndex(
    (item) => item.product.toString() === req.params.productID
  );

  if (cartItemIndex !== -1) {
    if (user.cart[cartItemIndex].quantity > 1) {
      user.cart[cartItemIndex].quantity -= 1;
    } else {
      user.cart.splice(cartItemIndex, 1);
    }
  }

  await user.save();
  res.redirect("/cart");
});

router.get("/pay-now/:userID", isLoggedIn, async (req, res) => {
  try {
    const totalPrice = parseFloat(req.query.totalPrice);
    const user = await userModel
      .findById(req.params.userID)
      .populate("cart.product");

    user.totalPrice += totalPrice;

    const newSales = user.cart.map((item) => {
      const totalEarnings = item.quantity * item.product.pPrice;
      return {
        productId: item.product._id,
        userId: req.user._id,
        quantity: item.quantity,
        consumerName: req.user.fullName,
        totalEarnings,
      };
    });

    await saleModel.create(newSales);

    user.purchasedProducts.push(...user.cart.map((item) => item.product._id));
    user.cart = [];

    await user.save();
    res.redirect("/shop");
  } catch (err) {
    console.error("Error creating sales:", err);
    res.status(500).send("Error creating sales");
  }
});

//Admin Routes
router.get("/admin", isLoggedIn, (req, res) => {
  res.render("admin");
});

router.post("/admin", upload.single("pPhoto"), isLoggedIn, async (req, res) => {
  const product = new productModel({
    pName: req.body.pName,
    pPrice: req.body.pPrice,
    pDescription: req.body.pDescription,
    userId: req.user._id,
    pPhoto: req.file.filename,
  });
  await product.save();
  res.redirect("/shop");
});

router.get("/admin-products", isLoggedIn, async (req, res) => {
  try {
    const products = await productModel.find({ userId: req.user._id });
    const productIds = products.map((product) => product._id);

    const sales = await saleModel
      .find({ productId: { $in: productIds } })
      .populate("productId")
      .populate("userId");

    const totalEarnings = sales.reduce(
      (acc, sale) => acc + sale.totalEarnings,
      0
    );

    res.render("admin-products", { products, sales, totalEarnings });
  } catch (err) {
    console.error("Error fetching admin products:", err);
    res.status(500).send("Error fetching admin products");
  }
});

router.post("/delete-product/:productId", isLoggedIn, async (req, res) => {
  try {
    await productModel.findOneAndDelete({
      _id: req.params.productId,
      userId: req.user._id,
    });
    res.redirect("/admin-products");
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).send("Error deleting product");
  }
});


///
module.exports = router;