import React from "react";
import { useState } from "react";
import { User } from "./User.js";
import missingModule from "./missing.js";

export default function DependencyTest() {
  const [name, setName] = useState("Sajid");
  return name;
}
