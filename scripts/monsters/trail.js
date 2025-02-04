async function TrailChatMessage(actor) {
    let chatContent =`
            <p><b>${actor.name} walked over a <span style="color:red">Slippery trail</span>.</b></p>
            <p>You must succeed on a <b>[[/save ability=dex dc=12]]</b> Dexterity saving throw or fall prone.</p>
            <button class="apply-condition" data-actor-id="${actor.id}" data-condition="prone">Apply Prone Condition</button>
            `;

    if (chatContent) {
        await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor }),
            content: chatContent,
            type: CONST.CHAT_MESSAGE_STYLES.OTHER
        });
    }
}


function sortRectangleCorners(rect) {
    // Compute centroid
    let centroid = rect.reduce((acc, point) => [acc[0] + point[0], acc[1] + point[1]], [0, 0]);
    centroid = [centroid[0] / rect.length, centroid[1] / rect.length];

    // Sort points counter-clockwise based on angle relative to centroid
    return rect.slice().sort((a, b) => {
        let angleA = Math.atan2(a[1] - centroid[1], a[0] - centroid[0]);
        let angleB = Math.atan2(b[1] - centroid[1], b[0] - centroid[0]);
        return angleA - angleB;
    });
}

export function isOverlapping(rect1, rect2, epsilon = 10) {
    function getEdges(rect) {
        return [
            [rect[1][0] - rect[0][0], rect[1][1] - rect[0][1]], // Edge 1
            [rect[2][0] - rect[1][0], rect[2][1] - rect[1][1]], // Edge 2
            [rect[3][0] - rect[2][0], rect[3][1] - rect[2][1]], // Edge 3
            [rect[0][0] - rect[3][0], rect[0][1] - rect[3][1]]  // Edge 4
        ];
    }

    function getPerpendicular(edge) {
        let length = Math.hypot(edge[0], edge[1]);
        return length === 0 ? [0, 0] : [-edge[1] / length, edge[0] / length]; // Perpendicular unit vector
    }

    function project(rect, axis) {
        let projections = rect.map(point => point[0] * axis[0] + point[1] * axis[1]);
        return [Math.min(...projections), Math.max(...projections)];
    }

    function overlap(proj1, proj2, epsilon) {
        let isOverlapping = !(proj1[1] - epsilon < proj2[0] || proj2[1] - epsilon < proj1[0]);
        return isOverlapping;
    }

    // Sort both rectangles counter-clockwise
    rect1 = sortRectangleCorners(rect1);
    rect2 = sortRectangleCorners(rect2);

    // Get edges and perpendicular axes for both rectangles
    let edges1 = getEdges(rect1);
    let edges2 = getEdges(rect2);

    // Get perpendicular axes from each rectangle
    let axes = [...edges1, ...edges2].map(getPerpendicular);

    // Remove duplicate axes (avoid redundant checks)
    let uniqueAxes = Array.from(new Set(axes.map(axis => JSON.stringify(axis)))).map(str => JSON.parse(str));

    // Check projections along each axis
    for (let axis of uniqueAxes) {
        let proj1 = project(rect1, axis);
        let proj2 = project(rect2, axis);
        if (!overlap(proj1, proj2, epsilon)) {
            return false; // Separating axis found, no overlap
        }
    }

    return true; // No separating axis found, rectangles overlap
}


function did_move(token, update){
    //console.log(token);
    let x1 = token.x + token.object.w/2;
    let y1 = token.y + token.object.h/2;
    let x2 = update.x || token.x;
    let y2 = update.y || token.y;
    x2 += token.object.w/2;
    y2 += token.object.h/2;
    if (x1 === x2 && y1 === y2) return false;
    return [x1, y1, x2, y2];
}

function calculate_line([x1, y1, x2, y2, tokenWidth], extend=false){
    // pad with half width of token
    let dx = x2 - x1;
    let dy = y2 - y1;

    // Compute length of the direction vector
    let length = Math.sqrt(dx ** 2 + dy ** 2);

    let dir_x = dx / length;
    let dir_y = dy / length;

    // Extend the endpoints by half the width in each direction
    
    let ext_x1 = x1;
    let ext_y1 = y1;
    let ext_x2 = x2;
    let ext_y2 = y2;
    
    if (extend){
        let half_width = tokenWidth / 2;
        ext_x1 = Math.floor(x1 - dir_x * half_width);
        ext_y1 = Math.floor(y1 - dir_y * half_width);
        ext_x2 = Math.floor(x2 + dir_x * half_width);
        ext_y2 = Math.floor(y2 + dir_y * half_width);
    }

    
    let width = Math.max(ext_x1, ext_x2) - Math.min(ext_x1, ext_x2);
    let height = Math.max(ext_y1, ext_y2) - Math.min(ext_y1, ext_y2);
    let x = Math.min(ext_x1, ext_x2);
    let y = Math.min(ext_y1, ext_y2);
    let px1 = ext_x1-x;
    let py1 = ext_y1-y;
    let px2 = ext_x2-x;
    let py2 = ext_y2-y;

    return [px1, py1, px2, py2, x, y, height, width];
}

function corners_from_points([px1, py1, px2, py2, x, y, tokenWidth]){
    
    let x1 = x + px1;
    let y1 = y + py1;
    let x2 = x + px2;
    let y2 = y + py2;
    
    
    // Compute direction vector
    let dx = x2 - x1;
    let dy = y2 - y1;
    //console.log("dx, dy", dx, dy);

    // Compute length of the direction vector
    let length = Math.sqrt(dx ** 2 + dy ** 2);
    //console.log("length", length);

    // Compute perpendicular unit vector
    let perp_x = -dy / length;
    let perp_y = dx / length;
    //console.log("perp", perp_x, perp_y);
    

    // Compute perpendicular offset
    let offset_x = Math.floor(perp_x * tokenWidth/2);
    let offset_y = Math.floor(perp_y * tokenWidth/2);
    //console.log("offset", offset_x, offset_y);

    // Compute the four corners of the rectangle
    let corner1 = [x1 + offset_x, y1 + offset_y];
    let corner2 = [x1 - offset_x, y1 - offset_y];
    let corner3 = [x2 + offset_x, y2 + offset_y];
    let corner4 = [x2 - offset_x, y2 - offset_y];

    //console.log({ corner1, corner2, corner3, corner4 });

    return [corner1, corner2, corner3, corner4 ];


}



Hooks.on('preUpdateToken', async function (token, update) {
    // Immune to the Open Tap effect if they have it themselves
    if (token.actor.effects.some(effect => effect.name === "Open Tap")){return;}

    //console.log(token);
    // Dont continue if the character didnt move
    let move = did_move(token, update);
    if (move === false){return;}

    // Find tokens that have a Open Tap effect
    let open_tap_tokens = [];
    for (let token_idx in canvas.tokens.objects.children){
        let token = canvas.tokens.objects.children[token_idx];
        //console.log(token);
        if(token.actor.effects.some(effect => effect.name === "Open Tap")){
            open_tap_tokens.push(token);
        }
    } 
    if (open_tap_tokens.length === 0){return;}

    // Calculate area below characters move
    let tokenWidth = token.width*canvas.dimensions.size;
    move.push(tokenWidth);
    //console.log(move);
    //console.log(move);
    let [px1, py1, px2, py2, x, y, height, width] = calculate_line(move, false);
    let movedArea = corners_from_points([px1, py1, px2, py2, x, y, tokenWidth]);

    //console.log(open_tap_token);

    let drawing_ids_in_canvas = canvas.drawings.objects.children.map(drawing => drawing.document._id);
    // Reset the flag with deleted drawings

    for (let open_tap_token of open_tap_tokens) {
        let token_paths = open_tap_token.document.getFlag("dnd5e-alcohol", "path") || [];
        // Filter out drawings that are no longer in the canvas
        let updated_paths = token_paths.filter(path => drawing_ids_in_canvas.includes(path.id));
        // Update the flag with only valid drawings on canvas
        await open_tap_token.document.setFlag("dnd5e-alcohol", "path", updated_paths);

        //console.log("updated drawings", updated_paths);
        for (let path of updated_paths){
            
            //console.log("path corner", path.corners);
            //console.log("movedArea", movedArea);
            if (isOverlapping(movedArea, path.corners)){
                //console.log("Token passed over trail?");
                await TrailChatMessage(token.actor);
            }
        }
    }

    //console.log("Open tap tokens", open_tap_tokens);

});


// Making a trail, thanks @Xaukael
Hooks.on('preUpdateToken', async function (token, update) {
    // Check that actor has "open tap"-effect active
    let open_tap = false;
    for (const effect_index in token.actor.effects.contents){
        let effect = token.actor.effects.contents[effect_index];
        //console.log(effect);
        if (effect.name == "Open Tap" & effect.active){
            open_tap = true;
        }
    }
    if (!open_tap){return;}

    // Check if the token has moved
    let move = did_move(token, update);
    if (move === false){return};
    //let [x1, y1, x2, y2] = move;
    let tokenWidth = token.width*canvas.dimensions.size;
    move.push(tokenWidth);
    let points = calculate_line(move, true);
    let [px1, py1, px2, py2, x, y, height, width] = points;
    
    let data = {author: game.user, x, y,  
        shape: {type:"p", points: [px1, py1, px2, py2], height, width}, 
        strokeWidth: tokenWidth,
        strokeColor: "#cc9028",
        strokeAlpha: 0.5}
    let drawing = await canvas.scene.createEmbeddedDocuments("Drawing", [data]);
    //console.log(drawing);
    let drawings = await token.getFlag("dnd5e-alcohol", "path") || [];
    //console.log(drawing[0]._id);
    
    let drawing_obj = {
        id: drawing[0].id,
        points: points,
        corners: corners_from_points([px1, py1, px2, py2, x, y, tokenWidth])

    }
    //console.log(drawing_obj);

    await drawings.push(drawing_obj);
    //console.log(drawings);
    await token.setFlag("dnd5e-alcohol", "path", drawings);
    //console.log(token);

  });