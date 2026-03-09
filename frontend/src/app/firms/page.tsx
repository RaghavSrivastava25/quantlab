"use client";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import clsx from "clsx";

type Firm = {
  name: string;
  website?: string;
  type: string[];        // HFT, Hedge Fund, Prop Trading, Investment Bank, Broker, Asset Manager, Commodity, Tech
  side: string[];        // Buy Side, Sell Side
  office: string[];      // Front Office, Middle Office, Back Office
  region: string[];      // US, Europe, Asia, India, Global
  roles: string[];
  notes?: string;
};

const ROLES_ALL = [
  "Quant Analyst","Quant Researcher","Quant Trader","Portfolio Manager",
  "Data Scientist","Data Analyst","Machine Learning Engineer","Software Engineer",
  "DevOps Engineer","Infrastructure Engineer","Trade Monitor","Trade Operations Analyst",
  "Risk Analyst","Systematic Trader","Execution Trader","Market Maker","Algo Developer",
];

const FIRMS: Firm[] = [
  // ── HFTs ──────────────────────────────────────────────────────────────────
  { name:"Citadel Securities",    website:"https://www.citadelsecurities.com", type:["HFT","Market Maker"], side:["Sell Side"], office:["Front Office"], region:["US","Europe","Asia","Global"], roles:["Quant Researcher","Quant Trader","Software Engineer","Machine Learning Engineer","Market Maker"], notes:"Largest US market maker" },
  { name:"Jane Street",           website:"https://www.janestreet.com",         type:["HFT","Prop Trading"], side:["Buy Side"], office:["Front Office"], region:["US","Europe","Asia","Global"], roles:["Quant Trader","Quant Researcher","Software Engineer","Market Maker"], notes:"Known for hardest quant interviews" },
  { name:"Jump Trading",          website:"https://www.jumptrading.com",         type:["HFT","Prop Trading"], side:["Buy Side"], office:["Front Office"], region:["US","Europe","Asia","Global"], roles:["Quant Researcher","Quant Trader","Software Engineer","Machine Learning Engineer"] },
  { name:"Optiver",               website:"https://optiver.com",                 type:["HFT","Market Maker"], side:["Buy Side"], office:["Front Office"], region:["US","Europe","Asia","Global"], roles:["Quant Trader","Quant Researcher","Software Engineer","Algo Developer","Trade Monitor"] },
  { name:"IMC Trading",           website:"https://www.imc.com",                 type:["HFT","Market Maker"], side:["Buy Side"], office:["Front Office"], region:["US","Europe","Asia","Global"], roles:["Quant Trader","Quant Researcher","Software Engineer","Market Maker"] },
  { name:"HRT",                   website:"https://www.hudsonrivertrading.com",  type:["HFT","Prop Trading"], side:["Buy Side"], office:["Front Office"], region:["US","Europe","Global"],       roles:["Quant Researcher","Software Engineer","Machine Learning Engineer","Algo Developer"] },
  { name:"Five Rings",            website:"https://fiverings.com",               type:["HFT","Prop Trading"], side:["Buy Side"], office:["Front Office"], region:["US"],                         roles:["Quant Trader","Software Engineer","Quant Researcher"] },
  { name:"Flow Traders",          website:"https://www.flowtraders.com",         type:["HFT","Market Maker"], side:["Sell Side"], office:["Front Office"], region:["US","Europe","Asia","Global"], roles:["Quant Trader","Quant Researcher","Software Engineer","Market Maker"] },
  { name:"Virtu Financial",       website:"https://www.virtu.com",               type:["HFT","Market Maker"], side:["Sell Side"], office:["Front Office"], region:["US","Europe","Asia","Global"], roles:["Quant Researcher","Software Engineer","Market Maker","Execution Trader"] },
  { name:"Akuna Capital",         website:"https://akunacapital.com",             type:["HFT","Market Maker"], side:["Buy Side"], office:["Front Office"], region:["US","Europe","Asia"],          roles:["Quant Trader","Quant Analyst","Software Engineer","Machine Learning Engineer"] },
  { name:"DRW",                   website:"https://drw.com",                     type:["HFT","Prop Trading"], side:["Buy Side"], office:["Front Office"], region:["US","Europe","Asia","Global"], roles:["Quant Trader","Quant Researcher","Software Engineer","Data Scientist"] },
  { name:"Chicago Trading Company",website:"https://www.chicagotradingco.com",  type:["HFT","Market Maker"], side:["Buy Side"], office:["Front Office"], region:["US","Europe"],                 roles:["Quant Trader","Quant Analyst","Software Engineer","Market Maker"] },
  { name:"Belvedere Trading",     website:"https://www.belvederetrading.com",    type:["HFT","Market Maker"], side:["Buy Side"], office:["Front Office"], region:["US"],                         roles:["Quant Trader","Software Engineer","Quant Researcher"] },
  { name:"Old Mission",           website:"https://www.oldmissioncapital.com",   type:["HFT","Market Maker"], side:["Buy Side"], office:["Front Office"], region:["US"],                         roles:["Quant Trader","Software Engineer","Quant Researcher","Market Maker"] },
  { name:"Geneva Trading",        website:"https://www.genevatrading.com",       type:["HFT","Prop Trading"], side:["Buy Side"], office:["Front Office"], region:["US","Europe"],                 roles:["Quant Trader","Software Engineer","Market Maker"] },
  { name:"Mako Trading",          website:"https://www.makotrading.com",         type:["HFT","Market Maker"], side:["Buy Side"], office:["Front Office"], region:["Europe","Asia"],               roles:["Quant Trader","Software Engineer","Market Maker"] },
  { name:"Maven Securities",      website:"https://www.mavensecurities.com",     type:["HFT","Market Maker"], side:["Sell Side"], office:["Front Office"], region:["Europe","Asia"],              roles:["Quant Trader","Software Engineer","Market Maker","Quant Researcher"] },
  { name:"Radix Labs",            type:["HFT","Prop Trading"],                  side:["Buy Side"], office:["Front Office"], region:["India"],                              roles:["Quant Trader","Quant Researcher","Software Engineer","Algo Developer"] },
  { name:"Vatic Labs",            website:"https://www.vaticlabs.com",           type:["HFT","Prop Trading"], side:["Buy Side"], office:["Front Office"], region:["US"],                         roles:["Machine Learning Engineer","Quant Researcher","Software Engineer"] },
  { name:"Eclipse Trading",       type:["HFT","Prop Trading"],                  side:["Buy Side"], office:["Front Office"], region:["India"],                              roles:["Quant Trader","Software Engineer","Algo Developer","Market Maker"] },
  { name:"Vector Trading",        type:["HFT","Prop Trading"],                  side:["Buy Side"], office:["Front Office"], region:["India"],                              roles:["Quant Trader","Software Engineer","Quant Researcher"] },
  { name:"iRage / iRageCapital",  website:"https://www.iragecapital.com",        type:["HFT","Market Maker"], side:["Buy Side"], office:["Front Office"], region:["India"],  roles:["Quant Trader","Algo Developer","Software Engineer","Market Maker","Quant Researcher"] },
  { name:"Alphagrep",             website:"https://www.alphagrep.com",           type:["HFT","Prop Trading"], side:["Buy Side"], office:["Front Office"], region:["India","Asia"],                roles:["Quant Trader","Quant Researcher","Software Engineer","Machine Learning Engineer"] },
  { name:"Ebullient Securities",  type:["HFT","Market Maker"],                  side:["Buy Side"], office:["Front Office"], region:["India"],                              roles:["Quant Trader","Software Engineer","Market Maker"] },
  { name:"DV Trading LLC",        website:"https://www.dvtrading.co",            type:["HFT","Prop Trading"], side:["Buy Side"], office:["Front Office"], region:["US","Europe"],                 roles:["Quant Trader","Quant Researcher","Software Engineer"] },
  { name:"Valkyrie Trading",      type:["HFT","Prop Trading"],                  side:["Buy Side"], office:["Front Office"], region:["US"],                                 roles:["Quant Trader","Software Engineer","Market Maker"] },
  { name:"TransMarketGroup",      website:"https://www.transmarketgroup.com",    type:["HFT","Market Maker"], side:["Buy Side"], office:["Front Office"], region:["US","Europe","Asia"],          roles:["Quant Trader","Software Engineer","Market Maker"] },
  { name:"Da Vinci",              type:["HFT","Market Maker"],                  side:["Buy Side"], office:["Front Office"], region:["Europe","Asia"],                      roles:["Quant Trader","Software Engineer","Market Maker"] },

  // ── PROP TRADING ──────────────────────────────────────────────────────────
  { name:"Peak6",                 website:"https://www.peak6.com",               type:["Prop Trading","Market Maker"], side:["Buy Side"], office:["Front Office"], region:["US"],              roles:["Quant Trader","Software Engineer","Market Maker","Quant Researcher"] },
  { name:"SIG / Susquehanna",     website:"https://sig.com",                     type:["Prop Trading","Market Maker"], side:["Buy Side"], office:["Front Office"], region:["US","Europe","Asia","Global"], roles:["Quant Trader","Quant Researcher","Software Engineer","Market Maker"], notes:"Notorious difficult interviews" },
  { name:"Seven Eight Capital",   type:["Prop Trading","HFT"],                  side:["Buy Side"], office:["Front Office"], region:["US"],                                 roles:["Quant Trader","Software Engineer","Quant Researcher"] },
  { name:"Headlands Technologies",website:"https://www.headlandstech.com",       type:["Prop Trading","HFT"], side:["Buy Side"], office:["Front Office"], region:["US"],                         roles:["Quant Researcher","Software Engineer","Quant Trader"] },
  { name:"Ansatz Capital",        type:["Prop Trading"],                         side:["Buy Side"], office:["Front Office"], region:["US"],                                 roles:["Quant Trader","Quant Researcher","Software Engineer"] },
  { name:"Acceltrade",            type:["Prop Trading"],                         side:["Buy Side"], office:["Front Office"], region:["India"],                              roles:["Quant Trader","Algo Developer","Software Engineer"] },
  { name:"Algoquant",             type:["Prop Trading","HFT"],                  side:["Buy Side"], office:["Front Office"], region:["India"],                              roles:["Quant Trader","Quant Researcher","Software Engineer","Algo Developer"] },
  { name:"Future First / Futures First", website:"https://www.futuresfirst.com",type:["Prop Trading","Market Maker"], side:["Buy Side"], office:["Front Office"], region:["India","Europe"],   roles:["Quant Trader","Quant Researcher","Algo Developer","Market Maker"] },
  { name:"NK Securities",         type:["Prop Trading","Broker"],               side:["Buy Side","Sell Side"], office:["Front Office","Middle Office"], region:["India"],   roles:["Quant Trader","Quant Researcher","Trade Operations Analyst"] },
  { name:"APT Portfolio",         type:["Prop Trading"],                         side:["Buy Side"], office:["Front Office","Middle Office"], region:["India"],              roles:["Quant Trader","Quant Analyst","Software Engineer"] },
  { name:"APT Research",          type:["Prop Trading"],                         side:["Buy Side"], office:["Front Office"], region:["India"],                              roles:["Quant Researcher","Quant Analyst","Software Engineer"] },
  { name:"Plutus Research",       type:["Prop Trading"],                         side:["Buy Side"], office:["Front Office"], region:["India"],                              roles:["Quant Researcher","Quant Analyst","Software Engineer","Algo Developer"] },
  { name:"Quadeeye",              type:["Prop Trading","HFT"],                  side:["Buy Side"], office:["Front Office"], region:["India"],                              roles:["Quant Trader","Quant Researcher","Software Engineer"] },
  { name:"River Quant Research",  type:["Prop Trading"],                         side:["Buy Side"], office:["Front Office"], region:["India"],                              roles:["Quant Researcher","Quant Analyst","Data Scientist"] },
  { name:"Quantbox Research",     type:["Prop Trading"],                         side:["Buy Side"], office:["Front Office"], region:["India"],                              roles:["Quant Trader","Quant Researcher","Algo Developer"] },
  { name:"QiCAP.Ai",              type:["Prop Trading"],                         side:["Buy Side"], office:["Front Office"], region:["India"],                              roles:["Quant Researcher","Machine Learning Engineer","Data Scientist"] },
  { name:"Mathisys",              type:["Prop Trading"],                         side:["Buy Side"], office:["Front Office"], region:["India"],                              roles:["Quant Researcher","Software Engineer","Algo Developer"] },
  { name:"XY Capital",            type:["Prop Trading","HFT"],                  side:["Buy Side"], office:["Front Office"], region:["India"],                              roles:["Quant Trader","Software Engineer","Quant Researcher"] },

  // ── HEDGE FUNDS ────────────────────────────────────────────────────────────
  { name:"Citadel",               website:"https://www.citadel.com",             type:["Hedge Fund"], side:["Buy Side"], office:["Front Office","Middle Office"], region:["US","Europe","Asia","Global"], roles:["Quant Researcher","Portfolio Manager","Data Scientist","Quant Analyst","Machine Learning Engineer"], notes:"Largest hedge fund globally" },
  { name:"DE Shaw",               website:"https://www.deshaw.com",              type:["Hedge Fund","Prop Trading"], side:["Buy Side"], office:["Front Office","Middle Office"], region:["US","Europe","India","Global"], roles:["Quant Researcher","Software Engineer","Machine Learning Engineer","Quant Trader","Data Scientist"] },
  { name:"Two Sigma",             website:"https://www.twosigma.com",            type:["Hedge Fund"], side:["Buy Side"], office:["Front Office","Middle Office"], region:["US","Europe","Asia","Global"], roles:["Quant Researcher","Data Scientist","Software Engineer","Machine Learning Engineer","Portfolio Manager"] },
  { name:"Renaissance Technologies",type:["Hedge Fund"],                        side:["Buy Side"], office:["Front Office"], region:["US"],                                 roles:["Quant Researcher","Machine Learning Engineer","Software Engineer","Quant Analyst"], notes:"Medallion Fund — most secretive" },
  { name:"Millennium Management", website:"https://www.mlp.com",                 type:["Hedge Fund"], side:["Buy Side"], office:["Front Office","Middle Office"], region:["US","Europe","Asia","Global"], roles:["Portfolio Manager","Quant Analyst","Quant Researcher","Risk Analyst"] },
  { name:"Point72",               website:"https://www.point72.com",             type:["Hedge Fund"], side:["Buy Side"], office:["Front Office","Middle Office"], region:["US","Europe","Asia","Global"], roles:["Quant Analyst","Portfolio Manager","Data Scientist","Machine Learning Engineer","Quant Researcher"] },
  { name:"AQR Capital",           website:"https://www.aqr.com",                 type:["Hedge Fund","Asset Manager"], side:["Buy Side"], office:["Front Office","Middle Office"], region:["US","Europe","Global"], roles:["Quant Researcher","Portfolio Manager","Data Scientist","Risk Analyst","Quant Analyst"] },
  { name:"Man Group",             website:"https://www.man.com",                 type:["Hedge Fund"], side:["Buy Side"], office:["Front Office","Middle Office"], region:["Europe","US","Asia","Global"], roles:["Quant Researcher","Portfolio Manager","Data Scientist","Machine Learning Engineer","Quant Analyst"] },
  { name:"Schonfeld Strategic",   website:"https://www.schonfeld.com",           type:["Hedge Fund"], side:["Buy Side"], office:["Front Office","Middle Office"], region:["US","Europe"],              roles:["Portfolio Manager","Quant Researcher","Data Scientist","Systematic Trader"] },
  { name:"Cubist Systematic",     type:["Hedge Fund"],                           side:["Buy Side"], office:["Front Office"], region:["US","Europe"],                        roles:["Quant Researcher","Portfolio Manager","Data Scientist","Machine Learning Engineer"] },
  { name:"Marshall Wace",         website:"https://www.marshall-wace.com",       type:["Hedge Fund"], side:["Buy Side"], office:["Front Office","Middle Office"], region:["Europe","US","Asia"],       roles:["Quant Researcher","Data Scientist","Portfolio Manager","Software Engineer"] },
  { name:"Arrowstreet Capital",   website:"https://www.arrowstreetcapital.com",  type:["Hedge Fund","Asset Manager"], side:["Buy Side"], office:["Front Office","Middle Office"], region:["US"],      roles:["Quant Researcher","Portfolio Manager","Quant Analyst","Data Scientist"] },
  { name:"PDT Partners",          website:"https://www.pdtpartners.com",         type:["Hedge Fund","Prop Trading"], side:["Buy Side"], office:["Front Office"], region:["US"],                       roles:["Quant Researcher","Software Engineer","Quant Trader","Quant Analyst"] },
  { name:"ExodusPoint Capital",   website:"https://www.exoduspoint.com",         type:["Hedge Fund"], side:["Buy Side"], office:["Front Office","Middle Office"], region:["US","Europe","Asia"],      roles:["Portfolio Manager","Quant Researcher","Risk Analyst","Quant Analyst"] },
  { name:"Voleon Group",          website:"https://www.voleon.com",              type:["Hedge Fund"], side:["Buy Side"], office:["Front Office"], region:["US"],                                 roles:["Machine Learning Engineer","Quant Researcher","Data Scientist","Software Engineer"] },
  { name:"Verition Fund Management",type:["Hedge Fund"],                         side:["Buy Side"], office:["Front Office","Middle Office"], region:["US"],                 roles:["Quant Analyst","Portfolio Manager","Risk Analyst","Quant Researcher"] },
  { name:"Viking Global Investors",website:"https://www.vikingglobal.com",       type:["Hedge Fund"], side:["Buy Side"], office:["Front Office","Middle Office"], region:["US","Europe"],             roles:["Portfolio Manager","Quant Analyst","Data Scientist"] },
  { name:"Trexquant Investment",  type:["Hedge Fund"],                           side:["Buy Side"], office:["Front Office","Middle Office"], region:["US"],                 roles:["Quant Researcher","Portfolio Manager","Data Scientist","Software Engineer"] },
  { name:"HAP Capital",           type:["Hedge Fund"],                           side:["Buy Side"], office:["Front Office","Middle Office"], region:["US"],                 roles:["Quant Analyst","Portfolio Manager","Quant Researcher"] },
  { name:"BAM / Balyasny",        website:"https://www.balyasny.com",            type:["Hedge Fund"], side:["Buy Side"], office:["Front Office","Middle Office"], region:["US","Europe","Asia"],      roles:["Portfolio Manager","Quant Researcher","Quant Analyst","Risk Analyst"] },
  { name:"Aquatic Capital",       type:["Hedge Fund","Prop Trading"],            side:["Buy Side"], office:["Front Office"], region:["US"],                                 roles:["Quant Researcher","Software Engineer","Machine Learning Engineer"] },
  { name:"G-Research",            website:"https://www.gresearch.com",           type:["Hedge Fund"], side:["Buy Side"], office:["Front Office"], region:["Europe"],        roles:["Quant Researcher","Data Scientist","Machine Learning Engineer","Software Engineer"] },
  { name:"GSA Capital",           website:"https://www.gsacapital.com",          type:["Hedge Fund"], side:["Buy Side"], office:["Front Office","Middle Office"], region:["Europe"],                  roles:["Quant Researcher","Portfolio Manager","Quant Analyst"] },
  { name:"Capula Investment",     website:"https://www.capula.com",              type:["Hedge Fund"], side:["Buy Side"], office:["Front Office","Middle Office"], region:["Europe","Asia"],            roles:["Quant Analyst","Portfolio Manager","Risk Analyst","Quant Researcher"] },
  { name:"Qube Research & Tech",  website:"https://www.qube-rt.com",             type:["Hedge Fund","HFT"], side:["Buy Side"], office:["Front Office"], region:["Europe","Asia"],                    roles:["Quant Researcher","Machine Learning Engineer","Software Engineer","Data Scientist"] },
  { name:"Dynamic Technology Lab",type:["Hedge Fund","HFT"],                    side:["Buy Side"], office:["Front Office"], region:["Asia"],                               roles:["Quant Researcher","Software Engineer","Machine Learning Engineer"] },
  { name:"Greenland Investment",  type:["Hedge Fund"],                           side:["Buy Side"], office:["Front Office","Middle Office"], region:["India"],              roles:["Portfolio Manager","Quant Analyst","Risk Analyst"] },
  { name:"Kivi Capital",          type:["Hedge Fund"],                           side:["Buy Side"], office:["Front Office","Middle Office"], region:["India"],              roles:["Quant Analyst","Portfolio Manager","Quant Researcher"] },
  { name:"Dolat Capital",         type:["Hedge Fund","Broker"],                 side:["Buy Side","Sell Side"], office:["Front Office","Middle Office"], region:["India"],   roles:["Quant Analyst","Portfolio Manager","Trade Monitor","Risk Analyst"] },
  { name:"Rebellion Research",    type:["Hedge Fund"],                           side:["Buy Side"], office:["Front Office"], region:["US"],                                 roles:["Quant Researcher","Machine Learning Engineer","Data Scientist"] },
  { name:"Alpha Alternatives",    type:["Hedge Fund","Alternative Investment"],  side:["Buy Side"], office:["Front Office","Middle Office"], region:["India"],              roles:["Quant Analyst","Portfolio Manager","Risk Analyst"] },
  { name:"Maverick Derivatives",  type:["Hedge Fund","Prop Trading"],           side:["Buy Side"], office:["Front Office"], region:["India"],                              roles:["Quant Trader","Quant Researcher","Algo Developer"] },
  { name:"Graviton Research Capital",website:"https://www.gravitonresearch.com",type:["Hedge Fund","HFT"], side:["Buy Side"], office:["Front Office"], region:["India"],   roles:["Quant Researcher","Quant Trader","Machine Learning Engineer","Software Engineer"] },
  { name:"Tower Research Capital",website:"https://www.tower-research.com",      type:["HFT","Prop Trading"], side:["Buy Side"], office:["Front Office"], region:["US","India","Global"], roles:["Quant Researcher","Software Engineer","Quant Trader","Machine Learning Engineer"] },
  { name:"Wolverine Trading",     website:"https://www.wolve.com",               type:["Prop Trading","Market Maker"], side:["Buy Side"], office:["Front Office"], region:["US"],              roles:["Quant Trader","Quant Researcher","Software Engineer","Market Maker"] },
  { name:"QuantLab",              website:"https://www.quantlab.com",            type:["HFT","Prop Trading"], side:["Buy Side"], office:["Front Office"], region:["US"],                         roles:["Quant Researcher","Software Engineer","Quant Trader"] },
  { name:"Blackedge Capital",     type:["Hedge Fund","Prop Trading"],           side:["Buy Side"], office:["Front Office"], region:["US","Asia"],                          roles:["Quant Researcher","Portfolio Manager","Machine Learning Engineer"] },

  // ── INVESTMENT BANKS ───────────────────────────────────────────────────────
  { name:"Goldman Sachs",         website:"https://www.goldmansachs.com",        type:["Investment Bank"], side:["Sell Side","Buy Side"], office:["Front Office","Middle Office","Back Office"], region:["US","Europe","Asia","India","Global"], roles:["Quant Analyst","Quant Researcher","Risk Analyst","Data Scientist","Software Engineer","Execution Trader"], notes:"Strats division highly regarded" },
  { name:"Morgan Stanley",        website:"https://www.morganstanley.com",       type:["Investment Bank"], side:["Sell Side","Buy Side"], office:["Front Office","Middle Office","Back Office"], region:["US","Europe","Asia","India","Global"], roles:["Quant Analyst","Risk Analyst","Data Scientist","Software Engineer","Quant Researcher"] },
  { name:"J.P. Morgan",           website:"https://www.jpmorgan.com",            type:["Investment Bank"], side:["Sell Side","Buy Side"], office:["Front Office","Middle Office","Back Office"], region:["US","Europe","Asia","India","Global"], roles:["Quant Analyst","Quant Researcher","Risk Analyst","Data Scientist","Software Engineer","Execution Trader"] },
  { name:"Citi",                  website:"https://www.citi.com",                type:["Investment Bank"], side:["Sell Side","Buy Side"], office:["Front Office","Middle Office","Back Office"], region:["US","Europe","Asia","India","Global"], roles:["Quant Analyst","Risk Analyst","Data Scientist","Software Engineer","Trade Operations Analyst"] },
  { name:"Barclays",              website:"https://www.barclays.com",            type:["Investment Bank"], side:["Sell Side","Buy Side"], office:["Front Office","Middle Office","Back Office"], region:["Europe","US","Asia","India","Global"], roles:["Quant Analyst","Risk Analyst","Data Scientist","Software Engineer","Quant Researcher"] },
  { name:"BNP Paribas",           website:"https://www.bnpparibas.com",          type:["Investment Bank"], side:["Sell Side","Buy Side"], office:["Front Office","Middle Office","Back Office"], region:["Europe","US","Asia","Global"],          roles:["Quant Analyst","Risk Analyst","Quant Researcher","Software Engineer","Data Scientist"] },
  { name:"UBS",                   website:"https://www.ubs.com",                 type:["Investment Bank"], side:["Sell Side","Buy Side"], office:["Front Office","Middle Office","Back Office"], region:["Europe","US","Asia","Global"],          roles:["Quant Analyst","Risk Analyst","Data Scientist","Software Engineer"] },
  { name:"Bank of America",       website:"https://www.bankofamerica.com",       type:["Investment Bank"], side:["Sell Side","Buy Side"], office:["Front Office","Middle Office","Back Office"], region:["US","Europe","Asia","Global"],          roles:["Quant Analyst","Risk Analyst","Data Scientist","Software Engineer","Trade Operations Analyst"] },
  { name:"Societe Generale",      website:"https://www.societegenerale.com",     type:["Investment Bank"], side:["Sell Side","Buy Side"], office:["Front Office","Middle Office","Back Office"], region:["Europe","US","Asia","Global"],          roles:["Quant Analyst","Quant Researcher","Risk Analyst","Data Scientist","Software Engineer"] },
  { name:"Macquarie Group",       website:"https://www.macquarie.com",           type:["Investment Bank","Asset Manager"], side:["Sell Side","Buy Side"], office:["Front Office","Middle Office"], region:["Australia","US","Europe","Asia","Global"], roles:["Quant Analyst","Risk Analyst","Data Scientist","Software Engineer"] },
  { name:"Numura / Nomura",       website:"https://www.nomura.com",              type:["Investment Bank"], side:["Sell Side","Buy Side"], office:["Front Office","Middle Office","Back Office"], region:["Asia","US","Europe","Global"],          roles:["Quant Analyst","Risk Analyst","Quant Researcher","Software Engineer","Data Scientist"] },

  // ── ASSET MANAGERS ─────────────────────────────────────────────────────────
  { name:"BlackRock",             website:"https://www.blackrock.com",           type:["Asset Manager"], side:["Buy Side"], office:["Front Office","Middle Office","Back Office"], region:["US","Europe","Asia","Global"], roles:["Quant Researcher","Portfolio Manager","Risk Analyst","Data Scientist","Machine Learning Engineer"] },
  { name:"PIMCO",                 website:"https://www.pimco.com",               type:["Asset Manager"], side:["Buy Side"], office:["Front Office","Middle Office"], region:["US","Europe","Asia","Global"], roles:["Quant Analyst","Portfolio Manager","Risk Analyst","Data Scientist"] },

  // ── COMMODITY / ENERGY ─────────────────────────────────────────────────────
  { name:"BP Trading",            type:["Commodity"],                            side:["Buy Side"], office:["Front Office","Middle Office"], region:["Europe","US","Global"], roles:["Quant Analyst","Risk Analyst","Data Scientist","Systematic Trader"] },
  { name:"Castleton Commodities", website:"https://www.castletoncommodities.com",type:["Commodity"], side:["Buy Side"], office:["Front Office","Middle Office"], region:["US","Europe"],             roles:["Quant Analyst","Risk Analyst","Quant Researcher","Systematic Trader"] },
  { name:"EDF Trading",           type:["Commodity"],                            side:["Buy Side"], office:["Front Office","Middle Office"], region:["Europe"],               roles:["Quant Analyst","Risk Analyst","Data Scientist","Systematic Trader"] },
  { name:"Equinor Trading",       website:"https://www.equinor.com",             type:["Commodity"],                            side:["Buy Side"], office:["Front Office","Middle Office"], region:["Europe","US"],               roles:["Quant Analyst","Risk Analyst","Data Scientist"] },

  // ── ALT INVESTMENT / OTHER ─────────────────────────────────────────────────
  { name:"TGS",                   type:["Alternative Investment"],               side:["Buy Side"], office:["Front Office","Middle Office"], region:["US"],                 roles:["Quant Researcher","Data Scientist","Machine Learning Engineer","Portfolio Manager"] },
  { name:"Selby Jennings",        type:["Alternative Investment","Broker"],      side:["Sell Side"], office:["Middle Office","Back Office"], region:["US","Europe"],        roles:["Quant Analyst","Data Analyst","Risk Analyst"] },
  { name:"Aquis Search",          type:["Alternative Investment"],               side:["Buy Side","Sell Side"], office:["Front Office","Middle Office"], region:["Europe"],  roles:["Quant Analyst","Risk Analyst","Data Analyst"] },
  { name:"XTX Markets",           website:"https://www.xtxmarkets.com",          type:["HFT","Market Maker"], side:["Sell Side"], office:["Front Office"], region:["Europe","US","Asia"], roles:["Quant Researcher","Machine Learning Engineer","Software Engineer","Market Maker"] },
  { name:"NK Securities Research",type:["Alternative Investment","Broker"],      side:["Sell Side"], office:["Front Office","Middle Office"], region:["India"],             roles:["Quant Analyst","Quant Researcher","Trade Monitor","Risk Analyst"] },

  // ── INDIA / APAC SPECIFIC ──────────────────────────────────────────────────
  { name:"Zerodha / Zerodha Tech",website:"https://zerodha.com",                type:["Broker","Prop Trading"],               side:["Sell Side","Buy Side"], office:["Front Office","Middle Office"], region:["India"], roles:["Quant Analyst","Software Engineer","Data Scientist","Algo Developer"] },
  { name:"Nuvama (Edelweiss)",    website:"https://www.nuvama.com",              type:["Broker","Investment Bank"],            side:["Sell Side","Buy Side"], office:["Front Office","Middle Office","Back Office"], region:["India"], roles:["Quant Analyst","Risk Analyst","Data Analyst","Trade Operations Analyst"] },
  { name:"IIFL Securities",       website:"https://www.iifl.com",               type:["Broker","Investment Bank"],            side:["Sell Side"], office:["Front Office","Middle Office","Back Office"], region:["India"], roles:["Quant Analyst","Risk Analyst","Software Engineer","Trade Operations Analyst"] },
  { name:"Kotak Securities",      website:"https://www.kotaksecurities.com",     type:["Broker"],                             side:["Sell Side"], office:["Front Office","Middle Office","Back Office"], region:["India"], roles:["Quant Analyst","Risk Analyst","Data Analyst","Trade Monitor"] },
  { name:"SBI Capital Markets",   website:"https://www.sbicaps.com",             type:["Investment Bank"],                    side:["Sell Side"], office:["Front Office","Middle Office","Back Office"], region:["India"], roles:["Quant Analyst","Risk Analyst","Data Analyst"] },
  { name:"HDFC Securities",       website:"https://www.hdfcsec.com",             type:["Broker"],                             side:["Sell Side"], office:["Front Office","Middle Office","Back Office"], region:["India"], roles:["Quant Analyst","Risk Analyst","Trade Operations Analyst"] },
  { name:"Anand Rathi",           website:"https://www.rathi.com",               type:["Broker","Investment Bank"],           side:["Sell Side","Buy Side"], office:["Front Office","Middle Office"], region:["India"], roles:["Quant Analyst","Portfolio Manager","Risk Analyst"] },
  { name:"White Oak Capital",     website:"https://www.whiteoakcap.com",         type:["Asset Manager","Hedge Fund"],         side:["Buy Side"], office:["Front Office","Middle Office"], region:["India"],              roles:["Quant Researcher","Portfolio Manager","Risk Analyst","Data Scientist"] },
  { name:"DSP Investment Mgrs",   website:"https://www.dspim.com",               type:["Asset Manager"],                      side:["Buy Side"], office:["Front Office","Middle Office"], region:["India"],              roles:["Quant Analyst","Portfolio Manager","Risk Analyst","Data Scientist"] },
  { name:"ICICI Prudential AMC",  website:"https://www.icicipruamc.com",         type:["Asset Manager"],                      side:["Buy Side"], office:["Front Office","Middle Office"], region:["India"],              roles:["Quant Analyst","Portfolio Manager","Risk Analyst"] },
  { name:"Macroaxis / SeSa",      type:["Prop Trading","HFT"],                  side:["Buy Side"], office:["Front Office"], region:["India","Asia"],                       roles:["Quant Trader","Software Engineer","Quant Researcher"] },

  // ── OTHER GLOBAL ───────────────────────────────────────────────────────────
  { name:"Winton Group",          website:"https://www.winton.com",              type:["Hedge Fund","Asset Manager"], side:["Buy Side"], office:["Front Office","Middle Office"], region:["Europe","US"],               roles:["Quant Researcher","Data Scientist","Machine Learning Engineer","Software Engineer"] },
  { name:"Squarepoint Capital",   website:"https://www.squarepoint-capital.com", type:["Hedge Fund"],                  side:["Buy Side"], office:["Front Office","Middle Office"], region:["Europe","US","Asia","Global"], roles:["Quant Researcher","Software Engineer","Data Scientist"] },
  { name:"WorldQuant",            website:"https://www.worldquant.com",          type:["Hedge Fund"],                  side:["Buy Side"], office:["Front Office"], region:["US","Europe","Asia","India","Global"], roles:["Quant Researcher","Quant Analyst","Data Scientist","Machine Learning Engineer"] },
  { name:"Susquehanna Intl (SIG)",website:"https://sig.com",                     type:["Prop Trading","Market Maker"], side:["Buy Side"], office:["Front Office"], region:["US","Europe","Asia"],          roles:["Quant Trader","Market Maker","Quant Researcher","Software Engineer"] },
];

const FIRM_TYPES = ["HFT","Prop Trading","Hedge Fund","Market Maker","Investment Bank","Asset Manager","Broker","Commodity","Alternative Investment"];
const SIDES = ["Buy Side","Sell Side"];
const OFFICES = ["Front Office","Middle Office","Back Office"];
const REGIONS = ["US","Europe","Asia","India","Global","Australia"];

const TYPE_COLORS: Record<string,string> = {
  "HFT":"bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
  "Prop Trading":"bg-violet-500/15 text-violet-300 border-violet-500/25",
  "Hedge Fund":"bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  "Market Maker":"bg-blue-500/15 text-blue-300 border-blue-500/25",
  "Investment Bank":"bg-amber-500/15 text-amber-300 border-amber-500/25",
  "Asset Manager":"bg-pink-500/15 text-pink-300 border-pink-500/25",
  "Broker":"bg-orange-500/15 text-orange-300 border-orange-500/25",
  "Commodity":"bg-lime-500/15 text-lime-300 border-lime-500/25",
  "Alternative Investment":"bg-rose-500/15 text-rose-300 border-rose-500/25",
};

export default function FirmsPage() {
  const [search, setSearch] = useState("");
  const [selTypes, setSelTypes] = useState<string[]>([]);
  const [selSide, setSelSide] = useState("all");
  const [selOffice, setSelOffice] = useState("all");
  const [selRegion, setSelRegion] = useState("all");
  const [selRole, setSelRole] = useState("all");

  const toggle = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  const filtered = FIRMS.filter(f => {
    const q = search.toLowerCase();
    if (q && !f.name.toLowerCase().includes(q)) return false;
    if (selTypes.length && !selTypes.some(t => f.type.includes(t))) return false;
    if (selSide !== "all" && !f.side.includes(selSide)) return false;
    if (selOffice !== "all" && !f.office.includes(selOffice)) return false;
    if (selRegion !== "all" && !f.region.includes(selRegion)) return false;
    if (selRole !== "all" && !f.roles.includes(selRole)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Quant Firms</h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} of {FIRMS.length} firms — HFTs, Hedge Funds, Prop Desks, Banks & more</p>
        </div>

        {/* Filters */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 mb-6 space-y-4">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search firms..."
            className="w-full bg-slate-800/60 border border-slate-700 focus:border-brand-500 rounded-xl px-4 py-2.5 text-slate-200 text-sm outline-none" />

          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Firm Type</p>
            <div className="flex flex-wrap gap-2">
              {FIRM_TYPES.map(t => (
                <button key={t} onClick={() => setSelTypes(prev => toggle(prev, t))}
                  className={clsx("px-3 py-1 rounded-full text-xs font-medium border transition-all",
                    selTypes.includes(t) ? TYPE_COLORS[t] || "bg-brand-500/20 text-brand-300 border-brand-500/30"
                      : "bg-slate-800/40 border-slate-700 text-slate-500 hover:text-slate-300")}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Side</p>
              <select value={selSide} onChange={e => setSelSide(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-300 text-xs outline-none">
                <option value="all">All</option>
                {SIDES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Office</p>
              <select value={selOffice} onChange={e => setSelOffice(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-300 text-xs outline-none">
                <option value="all">All</option>
                {OFFICES.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Region</p>
              <select value={selRegion} onChange={e => setSelRegion(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-300 text-xs outline-none">
                <option value="all">All</option>
                {REGIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Role</p>
              <select value={selRole} onChange={e => setSelRole(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-300 text-xs outline-none">
                <option value="all">All Roles</option>
                {ROLES_ALL.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {(selTypes.length > 0 || selSide !== "all" || selOffice !== "all" || selRegion !== "all" || selRole !== "all" || search) && (
            <button onClick={() => { setSelTypes([]); setSelSide("all"); setSelOffice("all"); setSelRegion("all"); setSelRole("all"); setSearch(""); }}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors underline">
              Clear all filters
            </button>
          )}
        </div>

        {/* Firm Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(firm => (
            <div key={firm.name} className="bg-slate-900/60 border border-slate-800 hover:border-slate-600 rounded-2xl p-4 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  {firm.website
                    ? <a href={firm.website} target="_blank" rel="noopener noreferrer"
                        className="font-bold text-slate-100 hover:text-brand-400 transition-colors flex items-center gap-1">
                        {firm.name} <ExternalLink size={11} className="text-slate-600" />
                      </a>
                    : <span className="font-bold text-slate-100">{firm.name}</span>}
                  {firm.notes && <p className="text-xs text-slate-600 mt-0.5">{firm.notes}</p>}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {firm.type.map(t => (
                  <span key={t} className={clsx("text-xs px-2 py-0.5 rounded-full border", TYPE_COLORS[t] || "bg-slate-800 text-slate-400 border-slate-700")}>
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex gap-2 flex-wrap mb-3 text-xs">
                {firm.side.map(s => <span key={s} className="text-slate-500">{s}</span>)}
                <span className="text-slate-700">·</span>
                {firm.office.map(o => <span key={o} className="text-slate-500">{o}</span>)}
                <span className="text-slate-700">·</span>
                {firm.region.slice(0,3).map(r => <span key={r} className="text-slate-500">{r}</span>)}
                {firm.region.length > 3 && <span className="text-slate-600">+{firm.region.length-3}</span>}
              </div>

              <div className="flex flex-wrap gap-1">
                {firm.roles.slice(0,4).map(r => (
                  <span key={r} className="text-xs bg-slate-800 text-slate-500 px-2 py-0.5 rounded-md">{r}</span>
                ))}
                {firm.roles.length > 4 && (
                  <span className="text-xs text-slate-600 px-1">+{firm.roles.length-4} more</span>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-20 text-slate-600">No firms match your filters.</div>
          )}
        </div>
      </div>
    </div>
  );
}
