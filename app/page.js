'use client' //to make client-sided app
import Image from "next/image";
import * as React from 'react';
import Papa from 'papaparse';
import autoTable from 'jspdf-autotable'
//state variables and client-sided functions that will be used from react
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, Modal, Typography, Stack, TextField, Button, Grid, Menu, MenuItem, Fade} from "@mui/material";
import { collection, deleteDoc, doc, getDocs, query, setDoc, getDoc } from "firebase/firestore";
import jsPDF from 'jspdf';

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [searchItem, setSearchItem] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc)=>{
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
  }

  //helper function to search for an item
  const searchItemFunction = async(itemToSearch) => {
    setSearchItem(itemToSearch)
    if(itemToSearch === '') { //search item is an empty string, return full inventory
      setFilteredInventory(inventory)
    }
    else{
      const filtered = inventory.filter(item => item.name.toLowerCase().includes(itemToSearch.toLowerCase()))
      setFilteredInventory(filtered)
    }
  }

  //helper function that exports inventory as CSV file
  const exportToCSV = async(data, fileName) =>{
    var csv = Papa.unparse(data)
    var csv_data = new Blob([csv], {type: 'text/csv;charset=utf-8;'})
    var url = URL.createObjectURL(csv_data)
    var temp = document.createElement('a') 
    temp.href = url
    temp.setAttribute('download', 'inventory.csv')
    temp.click()
  }

  //helper function that exports inventory as PDF file
  const exportPDF = async(data) =>{
    var doc = new jsPDF()
    doc.text("Inventory Items", 10, 10);
    autoTable(doc, {
      head: [['Item Name', 'Quantity']],
      body: data.map(item => [item.name, item.quantity])
    })
    doc.save('inventory.pdf')
  }

  //helper function that adds items
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()) { // if exists, increment by one
      const {quantity} = docSnap.data()
      await setDoc(docRef, {quantity: quantity + 1}) //set to quantity+1 
    }
    else { //if doesn't exist, set quantity to 1
      await setDoc(docRef, {quantity: 1})
    }

    await updateInventory()
  }

  //helper function that removes items
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()) {
      const {quantity} = docSnap.data()
      if(quantity === 1) {
        await deleteDoc(docRef) //delete if equal to 1
      }
      else {
        await setDoc(docRef, {quantity: quantity - 1}) //set to quantity-1 otherwise
      }
    }

    await updateInventory()
  }

  useEffect(()=>{
    updateInventory()
  }, [])

  useEffect(()=>{
    setFilteredInventory(inventory);
  }, [inventory]);

  //model helper functions to open/close
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const [anchorEl, setAnchorEl] = useState(null);
  const menu_open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      width = "100vw"
      height = "100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center" //centers horizontally
      alignItems = "center" //centers vertically
      gap = {2}
    >
      <Modal open = {open} onClose = {handleClose}>
        <Box
          position = "absolute"
          top = "50%"
          left = "50%"
          width={400}
          bgcolor="white"
          border = "2 px solid grey"
          boxShadow = {24}
          p = {4}
          display = "flex"
          flexDirection = "column"
          gap = {3}
          sx= {{ //SX means it's being directly applied as styles instead of prebuilt props
            transform: "translate(-50%,-50%)", //helps make it truly centered
          }}
        >
          <Typography variant = "h6"> Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant='outlined'
              fullWidth
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value)
              }}
            />
            <Button
              variant = "outlined"
              onClick={()=>{
                addItem(itemName) //add item to database on click
                setItemName('')
                handleClose()
              }}
            > Add </Button>
          </Stack>
        </Box>
      </Modal>
      <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={55}>
        <TextField
          variant="outlined"
          placeholder="Search items"
          value={searchItem}
          onChange={(e) => {
            searchItemFunction(e.target.value)
          }}
          width="500px"
          height="300px"
        />
        <Button
          variant = "contained"
          onClick = {() => {
          handleOpen()
        }}>
          Add New Item
        </Button>
      </Stack>
      <Box border = "1px solid grey"> 
        <Box width="800px" height="100px" bgcolor="#ccd5ae" display="flex" alignItems="center" justifyContent="center"> 
          <Typography variant = "h2" color="#333">
            Inventory Items
          </Typography>
        </Box>
        <Box width="800px" height="50px" bgcolor="#e9edc9" display="flex" alignItems="center" justifyContent="flex-start" gap={25} padding={4}>
          <Typography variant="h5" color="#333"> Item Name </Typography>
          <Typography variant="h5" color="#333"> Quantity</Typography>
        </Box>
        <Stack width = "800px" height = "300px" spacing={2} overflow="auto"> 
          {
            filteredInventory.map(({name, quantity})=> (
              <Grid container key={name} spacing={4} alignItems="center" bgcolor="#ffffff" padding={1}>
                <Grid item xs={4}>
                  <Typography variant="h6" color="#333">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                </Grid>
                <Grid item xs={3} textAlign="center">
                  <Typography variant="h6" color="#333">
                    {quantity}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button variant="outlined" color="success" onClick={() => addItem(name)}>
                      Add (+1)
                    </Button>
                    <Button variant="outlined" color="error" onClick={() => removeItem(name)}>
                      Remove (-1)
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            ))
          }
        </Stack>
      </Box>
      <Stack direction = "row" justifyContent="flex-end"  alignItems="center" spacing={81}>
      <Typography></Typography>
      {/* Menu button code from MUI docs */}
      <Button 
        id="fade-button"
        aria-controls={menu_open ? 'fade-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={menu_open ? 'true' : undefined}
        onClick={handleMenuClick}
      >
        Export Options
      </Button>
      <Menu
        id="fade-menu"
        MenuListProps={{
          'aria-labelledby': 'fade-button',
        }}
        anchorEl={anchorEl}
        open={menu_open}
        onClose={handleMenuClose}
        TransitionComponent={Fade}
      >
        <MenuItem onClick={() => exportToCSV(inventory)}>CSV File</MenuItem>
        <MenuItem onClick={() => exportPDF(inventory)}>PDF File</MenuItem>
      </Menu>
      </Stack>
    </Box>
  ) 
}
