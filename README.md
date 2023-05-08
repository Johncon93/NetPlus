# NetPlus

  

Created by John Connor for COMP3000 - Computing Project.

  

BSc (Hons) Computer Science (Cyber Security) - University of Plymouth 2022/2023

  

## Description

  

SDN deployments utilise modern protocols such as OpenFlow to dynamically control network operations, however, these protocols are not compatible with traditional devices and for a business to adopt SDN they must procure new infrastructure at a cost that many are hesitant to commit. Time to procure these devices is also a limiting factor as the ongoing chip shortage continues to impact delivery lead times across the telecommunications industry. Businesses that do adopt SDN and replace their traditional devices are then in many cases resigning the old devices to landfill, further contributing towards the e-waste crisis that continues to plague developing countries.

  

These factors have formed the underlying concept of this project, NetPlus, an alternative solution where beneficial SDN functionality can be emulated and applied to traditional devices without replacing the legacy hardware. It is intended to serve as a proof-of-concept framework for achieving a hybrid architecture where traditional devices are empowered through software-based influence akin to functionality achieved by SDN solutions.

  
  

## Software-based influence over traditional devices

The solution provides a series of software-based mechanisms to assert influence over the underlying infrastructure. It is designed to utilise four key components:

  

* Node.js MVC web-application

* MongoDB database

* Python SDN Controllers

* VMware hosted GNS3 virtual environment

  

A HLD of the component interaction is presented below.

![NetPlus HLD](https://github.com/Johncon93/NetPlus/blob/main/design/Vid-HLD.png)

  

The solution forms a hyrbid-SDN architecture where end-devices residing within an infrastructure plane are dynamically influenced by software-based components that are logically de-coupled. The below diagram is a high-level overview of the proposed hybrid architecture.

  

![NetPlus Architecture](https://github.com/Johncon93/NetPlus/blob/main/design/Vid-NetPlusArch.png)

  

## Key benefits

  

### Dynamic programmability

End-devices are managed through the software-based components which enables dynamic functionality that adjust configuration and network operations through manual interaction or automatically based on pre-determined network events or performance thresholds.

  

Each device is polled by the solution to determine availability with the results collated in an external database for further analysis. This opens up the possibility of applying deep-learning techniques to the recorded data and create models that can identify anomalous behaviour and make predictions about network operations.

  

### Software-based traffic flow control

Software-based controllers utilise the border gateway protocol to establish peer relationships with the underlying devices. Enabling the propagation of routing tables derived from intelligent software-driven decision making that can automatically adjust traffic flow.

  

### Centralised management

Onboarded devices are collated within the external database and form a hierarchal structure. All entities that a user is responsible for are retrieved and displayed in a clean user-friendly interface. Network states are recorded and displayed which enables a user to identify which devices are operational and view current performance information.

  

Stored procedures allow a user to execute SSH commands without obtaining direct access to the underlying device, they require no knowledge of credentials and in many cases do not require advanced technical knowledge. Users authenticate with the application via man-machine mechanisms and the application establishes machine-machine authentication with the device. This separation enables non-technical users access to powerful commands that are typically restricted to the highest-level of privilege on a device, enabling their use without the risk of disruption to network operations through unrestricted access.

  

## Usage

NetPlus as a solution is designed to serve as a proof-of-concept for HSDN deployments utilising legacy traditional devices. The repository has been made public to provide access to University staff responsible for grading the COMP3000 module. Downloading the code and attempting to run will ultimately fail as key environment variables have been excluded for security purposes. The application also requires an instance of ExaBGP installed to the local machine and mapped to the BGP Controller script to correctly parse and translate BGP messages from devices.

  

A demonstration of the application has been recorded and uploaded to YouTube as per the module requirements, it can be viewed by accessing the below link.

https://www.youtube.com/watch?v=dk_mKtrmHPw
  

### Folder Structure

```

NETPLUS

│ README.md

│ app.js

│ components.js

│

└───controllers

│ │ BGP-Controller.py

│ │ DNS-Controller.py

│ │ HealthCheck-Controller.py

│ │ ICMP-Controller.py

│ │ OTP-Controller.py

│ │ SSH-Controller.py

│ │ SYSLOG-Controller.py

│ │

└───views

│ │ device.ejs

│ │ networks.ejs

│ │ result.ejs

│ │ sites.ejs

│

└───public

│ index.html

│ client.js

│ │

│ └───css

│ │ style.css

│ │

│ │└───img

│ │ layer-3-switch.jpg

│ │ router.jpg

│ │ workgroup-switch.jpg

```

  

## License

  

This project is licensed under the [MIT] License - see the LICENSE.md file for details about NetPlus and 3rd party components.

  

## Dependencies

  

### Python Modules

  

* [NetMiko](https://github.com/ktbyers/netmiko)

  

* [Ping3](https://pypi.org/project/ping3/)

  

* [Pyotp](https://github.com/pyauth/pyotp)

  

* [ExaBGP](https://github.com/Exa-Networks/exabgp)

  

* [PyMongo](https://github.com/mongodb/mongo-python-driver)

  

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
