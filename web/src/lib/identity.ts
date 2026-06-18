"use client";

const UID_KEY = "wt_uid";
const NAME_KEY = "wt_name";

const ADJECTIVES = ["Swift", "Calm", "Brave", "Lucky", "Cosmic", "Sunny", "Mellow", "Witty"];
const ANIMALS = ["Otter", "Falcon", "Panda", "Fox", "Koala", "Heron", "Lynx", "Whale"];

function randomName(): string {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const b = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${a} ${b}`;
}

export function getUid(): string {
  if (typeof window === "undefined") return "";
  let uid = localStorage.getItem(UID_KEY);
  if (!uid) { uid = crypto.randomUUID(); localStorage.setItem(UID_KEY, uid); }
  return uid;
}

export function getName(): string {
  if (typeof window === "undefined") return "";
  let name = localStorage.getItem(NAME_KEY);
  if (!name) { name = randomName(); localStorage.setItem(NAME_KEY, name); }
  return name;
}

export function setName(name: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(NAME_KEY, name.trim() || randomName());
}
