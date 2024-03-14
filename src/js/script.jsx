import React, { useEffect } from 'react';
import Experience from './Experience/Experience.js';
import * as THREE from 'three';

const ScriptComponent = () => {
  useEffect(() => {
    // Initialize the experience
    const experience = new Experience({
      targetElement: document.querySelector('.experience')
    });

    let boatMovement = false;
let shouldFollow = false;
let Mpressed = false;
let touchDevice = true
let lastTouchY = 0;

// Function to handle mouse movement
function handleMouseMove(event) {

    if (!experience.world.ocean&&!experience.world.wagon) return;

    experience.world.wagon.isFreeMoving = experience.world.ocean.parameters.isFreeMoving

    const boatMovementChanged = experience.world.ocean.parameters.boatMovement !== boatMovement;
    boatMovement = experience.world.ocean.parameters.boatMovement;
    console.log( experience.world.ocean.parameters.boatMovement);
    toggleJoystick( experience.world.ocean.parameters.boatMovement);
    let movementY = 0;

    // 
    if (boatMovementChanged) {

        document.dispatchEvent(new CustomEvent('MoveBoat', { detail: { event: event } }));
        
    }

    if (boatMovement) {
        document.dispatchEvent(new CustomEvent('movetheboat', { detail: { event: event } }));
    }
    if (Mpressed) {
        document.dispatchEvent(new CustomEvent('movetheboat', { detail: { event: event } }));
    }
}

// Function to move the boat based on mouse movement
// Create a joystick after the DOM has loaded


   


// Function to toggle camera follow mode
function toggleFollowMode(event) {
    var size=150;
    if(window.innerWidth<600){
        size=100;
    }
   
    // var sampleJoystick = {
    //     zone: document.getElementById("text-panel"),
    //     mode:'dynamic',
    //     position: {
    //       left: '50%',
    //       top: '50%'
    //     },
    //     size: 150,
    //     color: 'black'
    // };
    
    // var joystick = nipplejs.create(sampleJoystick);



    // joystick.on('move', function (evt, data) {
    //     if (!data.direction) return;

    //     let deltaX = 0, deltaZ = 0;
    //     var maxSpeed =0.0008
    //     // if(window.innerWidth<600){
    //     //  maxSpeed = 0.005; // Adjust based on your needs
    //     // }
    //     // else{
    //     //     maxSpeed=0.006
    //     // }
    //     switch (data.direction.angle) {
    //         case 'up':
    //             deltaZ =  maxSpeed;
    //             break;
    //         case 'down':
    //             deltaZ = -maxSpeed;
    //             break;
    //         case 'left':
    //             deltaX = maxSpeed;
    //             break;
    //         case 'right':
    //             deltaX = -maxSpeed;
    //             break;
    //         default:
    //             break;
    //     }

    //     // Update the horizontal and vertical progres
    //     experience.world.wagon.boatProgress+=deltaZ
    //     experience.world.wagon.horizontalProgress += deltaX;
    //     experience.world.wagon.verticalProgress += deltaZ;

    //     // Apply changes
    //     experience.world.wagon.update();
    // });

    if (event.key === 'm' || event.key === 'M') {
        toggleMPressed(Mpressed);

    }
    if (experience.world.wagon.models) {

       
        shouldFollow = !shouldFollow;

        if (shouldFollow) {
            experience.camera.setMode('follow');
            experience.camera.setFollowTarget(experience.world.wagon.models.boat);
        } else {
            const currentPosition = new THREE.Vector3().copy(experience.camera.modes.follow.instance.position);
            currentPosition.z += 10;
            currentPosition.y += 2;
            experience.camera.modes.debug.orbitControls.target.copy(currentPosition);
            experience.camera.modes.debug.orbitControls.update();
            experience.camera.setMode('debug');
        }

        if (experience.world.wagon.models.boat) {
            experience.world.wagon.update();
        }

    }
}
let joystick = null; // Keep a reference to the joystick
function toggleMPressed(Mpressed){
    Mpressed=!Mpressed;
    toggleJoystick(Mpressed);
}
function toggleJoystick(enabled) {
    // Clean up if disabling and joystick already exists
    if (!enabled && joystick) {
        joystick.destroy();
        joystick = null;
        return;
    }

    // Proceed to create the joystick if enabled
    if (enabled) {
        let size = 150;
        if(window.innerWidth < 600){
            size = 100;
        }
   
        var sampleJoystick = {
            zone: document.getElementById("text-panel"),
            mode: 'dynamic',
            position: { left: '50%', top: '50%' },
            size: size,
            color: 'black'
        };

        // Ensure we don't create multiple instances
        if (!joystick) {
            joystick = nipplejs.create(sampleJoystick);

            joystick.on('move', function (evt, data) {
                if (!data.direction) return;

                let deltaX = 0, deltaZ = 0;
                var maxSpeed = 0.0008;

                switch (data.direction.angle) {
                    case 'up': deltaZ = maxSpeed; break;
                    case 'down': deltaZ = -maxSpeed; break;
                    case 'left': deltaX = -maxSpeed; break;
                    case 'right': deltaX = maxSpeed; break;
                    default: break;
                }

                // Assuming `experience` is globally accessible or passed correctly
                experience.world.wagon.boatProgress+=deltaZ
                    experience.world.wagon.horizontalProgress += deltaX;
                    experience.world.wagon.verticalProgress += deltaZ;
            
                experience.world.wagon.update();
            });
        }
    }
}
// if (window.innerWidth < 600) {
//     // Listen for scroll on touch devices

//     document.ontouchmove = function (event) {
//         handleMouseMove(event)
//     }
//     console.log(document)
// } else {
//     // Listen for mouse movement on non-touch devices
//     console.log(window)
//     document.addEventListener('mousemove', handleMouseMove);
// }
// Attach event listeners
document.addEventListener('mousemove', handleMouseMove);

document.addEventListener('MoveBoat', toggleFollowMode);
document.addEventListener('keypress', toggleFollowMode)


    // Cleanup function
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('movetheboat', moveTheBoat);
      document.removeEventListener('MoveBoat', toggleFollowMode);
      document.removeEventListener('keypress', toggleFollowMode);
    };
  }, []);

  return null; // This component does not render anything to the DOM itself
};

export default ScriptComponent;
