import React from "react";

const Footer = () => {
  return (
    <div className="flex flex-col items-center w-full gap-10 pt-64 pb-10 text-white bg-top bg-coin">
      <div className="flex flex-col items-center gap-6 mb-6 text-primary-950">
        <p className="text-5xl text-center">JOIN US VIA</p>
        <h1 className="font-bold text-center text-8xl">DISCORD</h1>
        <button className="footer-btn">Join via Discord</button>
      </div>
      <div className="flex items-center gap-6">
        <a href="https://www.instagram.com/heweofficial">
          <img src="https://hewe.io/static/media/insta.078f4cdfd4436505235d905e07e7cd60.svg" />
        </a>
        <a href="https://twitter.com/heweofficial">
          <img src="https://hewe.io/static/media/x.cd2e8ad25a9a40e2f137e975b4fc92ac.svg" />
        </a>
        <a href="https://t.me/+7scBuSpxGZg2ZWFl">
          <img src="https://hewe.io/static/media/telegram.d3d8d350a8067c45c75c51083fce6816.svg" />
        </a>
        <a href="https://hewe.io/tokenomics#">
          <img src="https://hewe.io/static/media/doc.a460077c8c3da1abd9b33ebe065d08b5.svg" />
        </a>
      </div>
      <div className="flex items-center gap-10">
        <a href="">Terms and condition</a>
        <a href="">Privacy Policy</a>
        <a href="">Help & support</a>
      </div>
      <p className="text-lg font-medium">Copyright@2024 Health & Wealth. All Right Reserved</p>
    </div>
  );
};

export default Footer;
