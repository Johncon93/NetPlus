# NetPlus

Created by John Connor for COMP3000 - Computing Project.

BSc (Hons) Computer Science (Cyber Security) - University of Plymouth 2022/2023

## Description

SDN deployments utilise modern protocols such as OpenFlow to dynamically control network operations, however, these protocols are not compatible with traditional devices and for a business to adopt SDN they must procure new infrastructure at a cost that many are hesitant to commit. Time to procure these devices is also a limiting factor as the ongoing chip shortage continues to impact delivery lead times across the telecommunications industry. Businesses that do adopt SDN and replace their traditional devices are then in many cases resigning the old devices to landfill, further contributing towards the e-waste crisis that continues to plague developing countries.

These factors have formed the underlying concept of this project, NetPlus, an alternative solution where beneficial SDN functionality can be emulated and applied to traditional devices without replacing the legacy hardware. It is intended to serve as a proof-of-concept framework for achieving a hybrid architecture where traditional devices are empowered through software-based influence akin to functionality achieved by SDN solutions.


## Software-based influence over traditional devices
Text

![NetPlus HLD](https://github.com/Johncon93/NetPlus/blob/main/Screenshots%20and%20notes%20for%20COMP3000/Vid-HLD.png)
Text

![NetPlus Architecture](https://github.com/Johncon93/NetPlus/blob/main/Screenshots%20and%20notes%20for%20COMP3000/Vid-NetPlusArch.png)

### Dynamic programmability 
Text

### Software-based traffic flow control
Text

### Folder Structure
```
NETPLUS
│   README.md
│   app.js
│   components.js    
│
└───controllers
│   │   BGP-Controller.py
│   │   DNS-Controller.py
│   │   HealthCheck-Controller.py
│   │   ICMP-Controller.py
│   │   OTP-Controller.py
│   │   SSH-Controller.py
│   │   SYSLOG-Controller.py
│   │
└───views
│   │   device.ejs
│   │   networks.ejs
│   │   result.ejs
│   │   sites.ejs
│
└───public
│   index.html
│   client.js
│		│
│		└───css
│		│   style.css
│		│
│		│└───img
│		│   layer-3-switch.jpg
│		│   router.jpg
│		│   workgroup-switch.jpg
```

 
## License

 
This project is licensed under the [MIT] License - see the LICENSE.md file for details about NetPlus and 3rd party components.

  

## Acknowledgments

  ### Special Thanks
* [MAC M1 compatible GNS3 instance - Jeremy Grossman](https://github.com/GNS3/gns3-gui/discussions/3261)

### Software

* [GNS3](https://gns3.com/)

* [VMWare Fusion](https://www.vmware.com/uk/products/fusion.html)

* [Iterm2](https://iterm2.com/)


### JavaScript Libraries

* [Bootstrap](https://getbootstrap.com/)

* [JQuery](https://jquery.com/)


### Node.js Packages

* [Expressjs](https://expressjs.com/)

* [Nodemon](https://www.npmjs.com/package/nodemon)

* [Ejs](https://ejs.co/)

  

### Python Modules

* [NetMiko](https://github.com/ktbyers/netmiko)

* [Ping3](https://pypi.org/project/ping3/)

* [Pyotp](https://github.com/pyauth/pyotp)

* [ExaBGP](https://github.com/Exa-Networks/exabgp)

* [PyMongo](https://github.com/mongodb/mongo-python-driver)
  
