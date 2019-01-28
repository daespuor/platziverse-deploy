const yo=require('yo-yo')


module.exports= function renderHtml(agent,metrics){
    return yo`<div>
                    <div class="row">
                        <h3>${agent.name} (${agent.pid})</h3>
                        <p><span>${agent.hostname}</span></p>
                        <p><span id="connected${agent.uuid}"><b>Connected: ${agent.connected}</b></span></p>
                        <a class="waves-effect waves-light btn modal-trigger" href="#modal${agent.uuid}">Modal</a>
                    </div>
                    <div id="modal${agent.uuid}" class="modal">
                        <div class="modal-content">
                            ${metrics.map((m)=>{
                                return yo`<canvas id="${agent.uuid}${m.type}"></canvas>`
                            })}
                        </div>
                        <div class="modal-footer">
                            <a href="#!" class="modal-close waves-effect waves-green btn-flat">Close</a>
                        </div>
                    </div>
                </div>`
}