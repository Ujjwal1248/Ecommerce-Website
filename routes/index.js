const express = require("express");
const passport = require("passport");
const localStrategy = require("passport-local");
const router = express.Router();
const userModel = require("./users");
const productModel = require("./products");
const saleModel = require("./sale");
const upload = require("./multer");
<<<<<<< HEAD
const bargainModel = require("./bargain");

=======
>>>>>>> 220806751d1eb537ad2fdaabbd0da0803e3ae830

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

//Contact route
router.get("/contact", (req, res) => {
  res.render("contact");
})

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

<<<<<<< HEAD
// /cart route
=======
>>>>>>> 220806751d1eb537ad2fdaabbd0da0803e3ae830
router.get("/cart", isLoggedIn, async (req, res) => {
  const user = await userModel
    .findOne({ email: req.user.email })
    .populate("cart.product");

  let totalPrice = 0;
  user.cart.forEach((item) => {
<<<<<<< HEAD
    const price = item.bargainedPrice || item.product.pPrice;
    totalPrice += price * item.quantity;
=======
    totalPrice += item.product.pPrice * item.quantity;
>>>>>>> 220806751d1eb537ad2fdaabbd0da0803e3ae830
  });

  res.render("cart", { user, cartItems: user.cart, totalPrice });
});

<<<<<<< HEAD


router.get("/shop", isLoggedIn, async (req, res) => {
  const products = await productModel.find();
  const user = await userModel.findById(req.user._id);
  res.render("shop", { products, user });
});


=======
router.get("/shop", isLoggedIn, async (req, res) => {
  const products = await productModel.find();
  res.render("shop", { products });
});

>>>>>>> 220806751d1eb537ad2fdaabbd0da0803e3ae830
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
<<<<<<< HEAD
    const buyer = await userModel
      .findById(req.params.userID)
      .populate("cart.product");

    // Check if buyer has enough balance
    if (buyer.wallet < totalPrice) {
      return res.status(400).send("Insufficient wallet balance");
    }

    // Deduct from buyer's wallet
    buyer.wallet -= totalPrice;
    buyer.totalPrice += totalPrice;

    const newSales = [];

    for (const item of buyer.cart) {
      const product = item.product;
      const vendorId = product.userId; // The vendor's user _id

      const earnings = item.quantity * product.pPrice;

      // Add sale entry
      newSales.push({
        productId: product._id,
        userId: buyer._id,
        quantity: item.quantity,
        consumerName: buyer.fullName,
        totalEarnings: earnings,
      });

      // Credit vendor wallet
      const vendor = await userModel.findById(vendorId);
      if (vendor) {
        vendor.wallet += earnings;
        await vendor.save();
      }
    }

    await saleModel.create(newSales);

    // Move purchased items
    buyer.purchasedProducts.push(...buyer.cart.map((item) => item.product._id));
    buyer.cart = [];
    await buyer.save();

    res.redirect("/shop");
  } catch (err) {
    console.error("Error processing payment:", err);
    res.status(500).send("Error processing payment");
  }
});


//Wallet Routes
router.post("/wallet/add", isLoggedIn, async (req, res) => {
  const amount = parseFloat(req.body.amount);

  if (isNaN(amount) || amount <= 0) {
    return res.status(400).send("Invalid amount");
  }

  const user = await userModel.findById(req.user._id);
  user.wallet += amount;
  await user.save();

  res.redirect("/wallet"); // Or show a message/success page
});
router.get("/wallet", isLoggedIn, async (req, res) => {
  const user = await userModel.findById(req.user._id);
  res.render("wallet", { walletBalance: user.wallet });
});


//Barter Routes
// POST /bargain/:productId
router.post("/bargain/:productId", isLoggedIn, async (req, res) => {
  const product = await productModel.findById(req.params.productId);
  const proposedPrice = parseFloat(req.body.proposedPrice);

  if (!product || isNaN(proposedPrice)) {
    return res.status(400).send("Invalid product or price");
  }

  await bargainModel.create({
    buyerId: req.user._id,
    vendorId: product.userId,
    productId: product._id,
    proposedPrice
  });

  res.redirect("/shop"); // or send a confirmation message
});

// GET /bargains
router.get("/bargains", isLoggedIn, async (req, res) => {
  const bargains = await bargainModel
    .find({ vendorId: req.user._id, status: "pending" })
    .populate("productId buyerId");

  res.render("bargain-requests", { bargains });
});

// POST /bargain/:id/approve
router.post("/bargain/:id/approve", isLoggedIn, async (req, res) => {
  const bargain = await bargainModel.findById(req.params.id);
  if (!bargain || bargain.vendorId.toString() !== req.user._id.toString()) {
    return res.status(403).send("Unauthorized");
  }

  bargain.status = "approved";
  await bargain.save();

  const buyer = await userModel.findById(bargain.buyerId);
  buyer.cart.push({ product: bargain.productId, quantity: 1, bargainedPrice: bargain.proposedPrice });
  await buyer.save();

  res.redirect("/bargains");
});

// POST /bargain/:id/reject
router.post("/bargain/:id/reject", isLoggedIn, async (req, res) => {
  const bargain = await bargainModel.findById(req.params.id);
  if (!bargain || bargain.vendorId.toString() !== req.user._id.toString()) {
    return res.status(403).send("Unauthorized");
  }

  bargain.status = "rejected";
  await bargain.save();

  res.redirect("/bargains");
});

=======
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

>>>>>>> 220806751d1eb537ad2fdaabbd0da0803e3ae830
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
  res.redirect("/admin");
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